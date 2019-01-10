// To parse this JSON data, do
//
//     final infopacket = infopacketFromJson(jsonString);

import 'dart:convert';

Infopacket infopacketFromJson(String str) {
  final jsonData = json.decode(str);
  return Infopacket.fromJson(jsonData);
}

String infopacketToJson(Infopacket data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class Infopacket {
  String heartRate;
  String systolic;
  String diastolic;

  Infopacket({
    this.heartRate,
    this.systolic,
    this.diastolic,
  });

  factory Infopacket.fromJson(Map<String, dynamic> json) => new Infopacket(
    heartRate: json["heartRate"] == null ? null : json["heartRate"],
    systolic: json["systolic"] == null ? null : json["systolic"],
    diastolic: json["diastolic"] == null ? null : json["diastolic"],
  );

  Map<String, dynamic> toJson() => {
    "heartRate": heartRate == null ? null : heartRate,
    "systolic": systolic == null ? null : systolic,
    "diastolic": diastolic == null ? null : diastolic,
  };
}
