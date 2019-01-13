//we extract the validator logic from the application for testing
//purpose



class EmailFIeldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Email can\'t be empty': null;
  }
}

class PasswordFieldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Password can\'t be empty': null;
  }
}

class NameFieldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Name can\'t be empty' : null;
  }
}

class SurnameFieldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Surname can\'t be empty' : null;
  }
}

class StreetFieldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Street can\'t be empty' : null;
  }
}

class RegionFieldValidator {
  static String validate(String value) {
    return value.isEmpty ? 'Region can\'t be empty' : null;
  }
}