// main signatures

sig User {
	ssn: one SSN,
	diseases: set Disease
}

sig Company {

}

sig InfoPacket {

}

abstract sig DataAccessRequest {

}

sig DataAccess {

}

// user signatures

sig WearableDevice {

}

sig UserPreferences {

}

sig BodyInfo {

}

sig Disease {

}

// company signatures

sig SpecificRequest extends DataAccessRequest {

}

sig GroupRequest extends DataAccessRequest {

}

sig Subscription {

}

// general signatures

sig Notification {

}

sig SSN {

}

sig City {

}

sig Address {
	city: one City
}
