// To parse this JSON data, do
//
//     final request = requestFromJson(jsonString);

import 'dart:convert';

Request requestFromJson(String str) {
  final jsonData = json.decode(str);
  return Request.fromJson(jsonData);
}

String requestToJson(Request data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class Request {
  int id;
  String state;
  Company company;

  Request({
    this.id,
    this.state,
    this.company,
  });

  factory Request.fromJson(Map<String, dynamic> json) => new Request(
    id: json["id"],
    state: json["state"],
    company: Company.fromJson(json["company"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "state": state,
    "company": company.toJson(),
  };
}

class Company {
  int id;
  String vat;
  String name;

  Company({
    this.id,
    this.vat,
    this.name,
  });

  factory Company.fromJson(Map<String, dynamic> json) => new Company(
    id: json["id"],
    vat: json["vat"],
    name: json["name"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "vat": vat,
    "name": name,
  };
}
