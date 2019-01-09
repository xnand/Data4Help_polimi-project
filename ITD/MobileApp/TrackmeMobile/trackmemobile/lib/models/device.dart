// To parse this JSON data, do
//
//     final wearable = wearableFromJson(jsonString);

import 'dart:convert';

Wearable wearableFromJson(String str) {
  final jsonData = json.decode(str);
  return Wearable.fromJson(jsonData);
}

String wearableToJson(Wearable data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class Wearable {
  String macAddr;
  String name;

  Wearable({
    this.macAddr,
    this.name,
  });

  factory Wearable.fromJson(Map<String, dynamic> json) => new Wearable(
    macAddr: json["macAddr"],
    name: json["name"],
  );

  Map<String, dynamic> toJson() => {
    "macAddr": macAddr,
    "name": name,
  };
}
