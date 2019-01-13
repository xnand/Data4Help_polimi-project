
import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/models/user.dart';

void main() {
  String ssn = "453-05-4889";
  String name = "name_test";
  String surname = "surname_test";
  String sex = "male";
  String birthDate = "03/13/1997";
  String country = "country_test";
  String region = "region_test";
  String city = "city_test";
  String zipcode = "20127";
  String street = "street_test";
  String streetNr = "26";

  test('user constructor works properly', () {
    User user = new User(
        ssn: ssn,
        name: name,
        surname: surname,
        sex: sex,
        birthDate: birthDate,
        country: country,
        region: region,
        city: city,
        zipcode: zipcode,
        street: street,
        streetNr: streetNr
    );

    expect(user.ssn, ssn);
    expect(user.name, name);
    expect(user.surname, surname);
    expect(user.sex, sex);
    expect(user.birthDate, birthDate);
    expect(user.country, country);
    expect(user.region, region);
    expect(user.city, city);
    expect(user.zipcode, zipcode);
    expect(user.streetNr, streetNr);
  });

  test('User.toJson works properly', (){
    User user = new User(
        ssn: ssn,
        name: name,
        surname: surname,
        sex: sex,
        birthDate: birthDate,
        country: country,
        region: region,
        city: city,
        zipcode: zipcode,
        street: street,
        streetNr: streetNr
    );

    Map<String, dynamic> jsonUser =
    { 'ssn' : ssn,
      'name' :  name,
      'surname' : surname,
      'sex' : sex,
      'birthDate' : birthDate,
      'country' : country,
      'region' : region,
      'city' : city,
      'zipcode' : zipcode,
      'street' : street,
      'streetNr' : streetNr,
      'mail' : null,
      'password' : null

    };

    expect(user.toJson(), jsonUser);
  });

  test('User.fromJson works properly', (){

    Map<String, dynamic> jsonUser =
    { 'ssn' : ssn,
      'name' :  name,
      'surname' : surname,
      'sex' : sex,
      'birthDate' : birthDate,
      'country' : country,
      'region' : region,
      'city' : city,
      'zipcode' : zipcode,
      'street' : street,
      'streetNr' : streetNr,
      'mail' : null,
      'password' : null

    };

    User user = User.fromJson(jsonUser);


    expect(user.ssn, ssn);
    expect(user.name, name);
    expect(user.surname, surname);
    expect(user.sex, sex);
    expect(user.birthDate, birthDate);
    expect(user.country, country);
    expect(user.region, region);
    expect(user.city, city);
    expect(user.zipcode, zipcode);
    expect(user.streetNr, streetNr);
  });



}