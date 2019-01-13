import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/models/infopacket.dart';

void main() {

  String heartRate = "90";
  String systolic = "60";
  String diastolic = "75";

  test('Infopacket contructor works properly', () {
    Infopacket testPacket =  Infopacket(
      heartRate: heartRate,
      systolic: systolic,
      diastolic: diastolic
    );
    expect(testPacket.heartRate, heartRate);
    expect(testPacket.systolic, systolic);
    expect(testPacket.diastolic, diastolic);
  });

  test('Infopacket.toJson works properly', () {
    Infopacket testPacket =  Infopacket(
        heartRate: heartRate,
        systolic: systolic,
        diastolic: diastolic
    );
    Map<String, dynamic> jsonPacket = {
      "heartRate": heartRate,
      "systolic": systolic,
      "diastolic": diastolic
    };
    expect(testPacket.toJson(), jsonPacket);
  });

  test('Infopacket.fromJson works properly', () {
    Infopacket testPacket = Infopacket.fromJson({
      "heartRate": heartRate,
      "systolic": systolic,
      "diastolic": diastolic
    });

    expect(testPacket.heartRate, heartRate);
    expect(testPacket.systolic, systolic);
    expect(testPacket.diastolic, diastolic);

  });

}