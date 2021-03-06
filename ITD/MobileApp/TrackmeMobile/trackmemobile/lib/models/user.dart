// To parse this JSON data, do
//
//     final user = userFromJson(jsonString);

import 'dart:convert';

User userFromJson(String str) {
  final jsonData = json.decode(str);
  return User.fromJson(jsonData);
}

String userToJson(User data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class User {
  String ssn;
  String name;
  String surname;
  String sex;
  String birthDate;
  String country;
  String region;
  String city;
  String zipcode;
  String street;
  String streetNr;
  String password;
  String email;


  User({
    this.ssn,
    this.name,
    this.surname,
    this.sex,
    this.birthDate,
    this.country,
    this.region,
    this.city,
    this.zipcode,
    this.street,
    this.streetNr,
    this.password,
    this.email
  });

  factory User.fromJson(Map<String, dynamic> json) => new User(
    ssn: json["ssn"],
    name: json["name"],
    surname: json["surname"],
    sex: json["sex"],
    birthDate: json["birthDate"],
    country: json["country"],
    region: json["region"],
    city: json["city"],
    zipcode: json["zipcode"],
    street: json["street"],
    streetNr: json["streetNr"],
    password: json['password']
  );

  Map<String, dynamic> toJson() => {
    "ssn": ssn,
    "name": name,
    "surname": surname,
    "sex": sex,
    "birthDate": birthDate,
    "country": country,
    "region": region,
    "city": city,
    "zipcode": zipcode,
    "street": street,
    "streetNr": streetNr,
    "mail": email,
    "password": password
  };
}
