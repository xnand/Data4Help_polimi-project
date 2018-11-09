// The company ask for specific data about 3 users, 2 of the users
// accept company request, one user refuses.

open util/integer

// user signatures --------------------------------------------------

sig User {
	ssn : one SSN,
	city : one City,
	age: one Int,  // age instead of birthdate
	devices: some WearableDevice,
	acceptedRequests: set SpecificRequest
} {
	// all users are between 18 and 30 (for simplicity)
	age >= 18 and age < 30
}

sig WearableDevice {
	sentData : set InfoPacket
} {
	one dB : DataBroker | sentData in dB.availableData
}

sig SSN {}

sig City{}


// company signatures --------------------------------------------------

sig Company {
	requests: set DataAccessRequest,
	accessibleData: set InfoPacket
}

abstract sig DataAccessRequest {}

sig SpecificRequest extends DataAccessRequest {
	ssn: one SSN
}

sig GroupRequest extends DataAccessRequest {
	filters: some GroupRequestFilter
}

sig GroupRequestFilter {
	ageStart : lone Int,
	ageEnd : lone Int,
	city: lone City
} {
	// consistent with User data
	(ageStart >= 18 and ageStart < 30
	and ageEnd >= 18 and ageEnd >= 18) and
	// it either has one city or one ageStart or one ageEnd
	(one ageStart or one city or one ageEnd)
}

one sig DataBroker {
 	pendingRequests : set DataAccessRequest,
	authorizedRequests: set DataAccessRequest,
	availableData: set InfoPacket
}

// general signatures -----------------------------------------------------------

sig InfoPacket {}

// facts -----------------------------------------------------------

fact userConstraints {
	// every user has a different SSN
	all disj user1, user2 : User | user1.ssn != user2.ssn

	// every WearableDevice is owned by one user
	all device : WearableDevice | one user : User | device in user.devices
}

fact requestConstaints {
	// all requests are made by one company
	all req : DataAccessRequest | some company : Company | req in company.requests

	// no DataAccessRequest is neither in authorizedRequests nor pendingRequests but it has to be in one of the two
	all req: DataAccessRequest | one dB : DataBroker | (req in dB.pendingRequests and req not in dB.authorizedRequests) 
	or (req in dB.authorizedRequests and req not in dB.pendingRequests)

	// no pending SpecificRequest is in any User's acceptedRequests
	one dB : DataBroker | all req : SpecificRequest | 
	req in dB.pendingRequests implies all user : User | req not in user.acceptedRequests

	// a SpecificRequest can be accepted only by the proper user, and then it goes in authorizedRequests
	one dB : DataBroker | all req : SpecificRequest | all user : User |
	req in user.acceptedRequests <=> (req in dB.authorizedRequests and req.ssn = user.ssn)

	// a company can not make two SpecificRequests for the same SSN
	all company : Company | all disj req1, req2 : SpecificRequest |
	(req1 in company.requests and req2 in company.requests) implies req1.ssn != req2.ssn

	// every GroupRequestFilter is owned by a GroupRequest
	all grf : GroupRequestFilter | one gr : GroupRequest | grf in gr.filters

	// every InfoPacket is only sent by one WearableDevice
	all data : InfoPacket | one dev : WearableDevice | data in dev.sentData
}

// data of customers is available if and only if there exists an authorized GroupRequest or SpecificRequest
// the company made
fact dataAccess { all company : Company |  all user : User | one dB : DataBroker |
	(user.devices.sentData in company.accessibleData) iff (
		( // specific request
			some specReq : SpecificRequest | specReq in user.acceptedRequests and
			user.ssn = specReq.ssn
		) or ( // group request
			some groupReq : GroupRequest | some groupReqFilter : GroupRequestFilter |
			 groupReq in dB.authorizedRequests and groupReqFilter in groupReq.filters and
			(one groupReqFilter.ageStart implies user.age >= groupReqFilter.ageStart) and
			(one groupReqFilter.ageEnd implies user.age <= groupReqFilter.ageEnd) and
			(one groupReqFilter.city implies groupReqFilter.city = user.city)
		)
	)
}

assert noRequestNoDataAccess {
	some company : Company | one dB : DataBroker |
	#dB.availableData > 0 and
	(#company.requests = 0 or 
		all request : DataAccessRequest | 
		request in company.requests and request not in dB.authorizedRequests)
	implies #company.accessibleData = 0
}

assert authorizedRequestGrantsDataAccess {
	some company : Company | one dB : DataBroker | 
	#dB.availableData > 0 and
	(company.requests in dB.authorizedRequests and
	// there is data available for that request
		some user : User | user.devices.sentData in dB.availableData and
		( // specific request
			some specReq : SpecificRequest | specReq in user.acceptedRequests
		) or ( // group request
			some groupReq : GroupRequest | some groupReqFilter : GroupRequestFilter |
			 groupReq in dB.authorizedRequests and groupReqFilter in groupReq.filters and
			(one groupReqFilter.ageStart implies user.age >= groupReqFilter.ageStart) and
			(one groupReqFilter.ageEnd implies user.age <= groupReqFilter.ageEnd) and
			(one groupReqFilter.city implies groupReqFilter.city = user.city)
		)
	) implies #company.accessibleData > 0
}

assert thereIsAlwaysAGroupReqFilterForAUser {}

check noRequestNoDataAccess for 10 but exactly 15 DataAccessRequest, 20 InfoPacket
check authorizedRequestGrantsDataAccess for 10 but exactly 13 DataAccessRequest, 20 InfoPacket

pred show() {}
run show for 3 but exactly 3 User, 7 Int, 1 DataBroker, 1 Company
