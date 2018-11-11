open util/integer

// user signatures ------------------------------------------------------------

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


// company signatures ---------------------------------------------------------

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


// general signatures ---------------------------------------------------------

sig InfoPacket {}

one sig DataBroker {
 	pendingRequests : set DataAccessRequest,
	authorizedRequests: set DataAccessRequest,
	availableData: set InfoPacket
}


// facts ----------------------------------------------------------------------

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

	// a company has a subscription only if it made the request it is linked to
	all c : Company | all sub : Subscription | sub.request in c.requests
}

fact dataAccessConstraints {
	// all data from a user is accessible to the company
	// if it has access to even a single packet
	all c : Company | some u : User |
	(some data : InfoPacket | data in u.devices.sentData and data in c.accessibleData) implies
	(all data : InfoPacket | data in u.devices.sentData and data in c.accessibleData)

	// data sent from users device is accessible from a company if and only if
	// the company made a SpecificRequest that the user accepted
	// or it made a GroupRequest that was authorized and the user
	// satifies the criteria in GroupRequest's filters
	all c : Company | all u : User | one dB : DataBroker |
	(some data : InfoPacket | data in u.devices.sentData and data in c.accessibleData) iff
	(
		(some sr : SpecificRequest | sr in c.requests and sr in u.acceptedRequests)
		or
		(some gr : GroupRequest | some grf : GroupRequestFilter | grf in gr.filters and
		gr in dB.authorizedRequests and
		(one grf.ageStart implies u.age >= grf.ageStart) and
		(one grf.ageEnd implies u.age <= grf.ageEnd) and
		(one grf.city implies grf.city = u.city))
	)
}

// predicates and assertions --------------------------------------------------


pred companyMakeSpecificRequest [disj c1, c2 : Company, u : User] {
	one sr : SpecificRequest | sr not in c1.requests and sr not in u.acceptedRequests
	implies c2.requests = c1.requests + sr
}

run companyMakeSpecificRequest for 2 but 7 Int, exactly 0 GroupRequest,
	exactly 1 InfoPacket, exactly 1 SpecificRequest


pred userAcceptsSpecificRequest [disj u : User, disj sr1, sr2 : SpecificRequest, c : Company] {
	sr1 in c.requests and sr1 not in u.acceptedRequests implies
	sr2 in c.requests and sr2 in u.acceptedRequests
}

run userAcceptsSpecificRequest for 2 but 7 Int, exactly 0 GroupRequest, exactly 2 InfoPacket,
	exactly 2 SpecificRequest, exactly 2 Company, exactly 1 User


pred groupRequestOverview[c : Company, dB : DataBroker] {
	some gr : GroupRequest | gr in c.requests and gr in dB.authorizedRequests
}

run groupRequestOverview for 2 but 7 Int, exactly 1 GroupRequest


pred overview [disj d1, d2 : InfoPacket, c : Company] {
	d1 in c.accessibleData and d2 not in c.accessibleData
}

run overview for 2 but 7 Int, exactly 1 SpecificRequest, exactly 1 GroupRequest


assert noAuthorizedRequestMeansNoDataAccess {
	some company : Company | one dB : DataBroker |
	#dB.availableData > 0 and
	(#company.requests = 0 or
		all request : DataAccessRequest |
		request in company.requests and request not in dB.authorizedRequests)
	implies #company.accessibleData = 0
}

check noAuthorizedRequestMeansNoDataAccess for 10 but 7 Int, exactly 10 DataAccessRequest
