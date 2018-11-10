// The company ask for specific data about 3 users, 2 of the users
// accept company request, one user refuses.

open util/integer

// user signatures --------------------------------------------------

sig User {
	city : one City,
	age: one Int,  // age instead of birthdate
	devices: some WearableDevice,
	acceptedRequests: set SpecificRequest
} {
	// all users are between 18 and 30 (for simplicity)
	age >= 18 and age <= 30
	one dB : DataBroker | acceptedRequests in dB.authorizedRequests
}

sig WearableDevice {
	sentData : set InfoPacket
} {
	one dB : DataBroker | sentData in dB.availableData
}

sig City{}


// company signatures --------------------------------------------------

sig Company {
	requests: set DataAccessRequest,
	accessibleData: set InfoPacket,
	subscriptions: set Subscription,
}

abstract sig DataAccessRequest {}

sig SpecificRequest extends DataAccessRequest {
	user: one User
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
	ageStart >= 18 and ageStart <= 30 and
	ageEnd >= 18 and ageEnd <= 30 and
	// it either has one city or one ageStart or one ageEnd
	(one ageStart or one city or one ageEnd) and
		((one ageStart and one ageEnd) implies
		ageEnd >= ageStart)
}

sig Subscription {
	request : one DataAccessRequest,
	company : one Company
} {
	one dB : DataBroker | request in dB.authorizedRequests
}

// general signatures -----------------------------------------------------------

sig InfoPacket {}

one sig DataBroker {
 	pendingRequests : set DataAccessRequest,
	authorizedRequests: set DataAccessRequest,
	availableData: set InfoPacket
}

// facts -----------------------------------------------------------

fact userConstraints {
	// every WearableDevice is owned by one user
	all device : WearableDevice | one user : User | device in user.devices

	// every InfoPacket is only sent by one WearableDevice
	all data : InfoPacket | one dev : WearableDevice | data in dev.sentData
}

fact requestConstraints {
	// all requests are made by one company
	all req : DataAccessRequest | some company : Company | req in company.requests

	// no DataAccessRequest is neither in authorizedRequests nor pendingRequests but it has to be in one of the two
	all req: DataAccessRequest | one dB : DataBroker | 
		(req in dB.pendingRequests and req not in dB.authorizedRequests) or 
		(req in dB.authorizedRequests and req not in dB.pendingRequests)

	// no pending SpecificRequest is in any User's acceptedRequests
	one dB : DataBroker | all req : SpecificRequest | 
		req in dB.pendingRequests implies all user : User | req not in user.acceptedRequests
		
	// a SpecificRequest can be accepted only by the proper user, and then it goes in authorizedRequests
	one dB : DataBroker | all req : SpecificRequest | all u : User |
		req in u.acceptedRequests iff (req in dB.authorizedRequests and req.user = u)

	// a company can not make two SpecificRequests for the same User
	all company : Company | all disj req1, req2 : SpecificRequest |
		(req1 in company.requests and req2 in company.requests) implies req1.user != req2.user

	// every GroupRequestFilter is owned by a GroupRequest
	all grf : GroupRequestFilter | one gr : GroupRequest | grf in gr.filters
}

fact subscriptionConstraints {
	// every subscription is generated from a company
	all sub : Subscription | sub in sub.company.subscriptions

	// a company can not have two subscriptions for the same data (no 2 subscriptions with same request)
	all c : Company | all disj s1, s2 : Subscription | 
		(s1 in c.subscriptions and s2 in c.subscriptions) implies (s1.request != s2.request)
}

fact dataAccessConstraints {
	one dB : DataBroker | all c : Company | all u : User | 
	u.devices.sentData in c.accessibleData iff 
	(
		all data : InfoPacket | data in u.devices.sentData and
		(some sr : SpecificRequest | sr in u.acceptedRequests and sr in c.requests)
		or
		(some gr : GroupRequest, grf : GroupRequestFilter |
		grf in gr.filters and gr in c.requests and gr in dB.authorizedRequests and
		(one grf.ageStart implies u.age >= grf.ageStart) and
		(one grf.ageEnd implies u.age <= grf.ageEnd) and
		(one grf.city implies grf.city = u.city))
	)
}

assert noAuthorizedRequestMeansNoDataAccess {
	some company : Company | one dB : DataBroker |
	#dB.availableData > 0 and
	(#company.requests = 0 or 
		all request : DataAccessRequest | 
		request in company.requests and request not in dB.authorizedRequests)
	implies #company.accessibleData = 0
}

check noAuthorizedRequestMeansNoDataAccess for 5 but 7 Int, exactly 5 SpecificRequest, 5 GroupRequest, 5 InfoPacket, exactly 5 User


pred bo [c : Company, u1, u2 : User] {
	#c.accessibleData > 0 and
	#u1.devices.sentData > 0 and #u2.devices.sentData > 0 and u1 != u2
}

run bo for 5 but 7 Int


pred show {}
run show for 3 but 7 Int, exactly 3 User, exactly  GroupRequest, 3 Subscription, 2 SpecificRequest
