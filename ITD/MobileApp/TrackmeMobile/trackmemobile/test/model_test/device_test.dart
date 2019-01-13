import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/models/device.dart';

void main() {


  String macAddr = "00:11:22:33:44:55";
  String name = "test device name";


  test('Wearable constructor works properly', () {
    Wearable device = new Wearable(
        macAddr: macAddr,
        name: name
    );

    expect(device.macAddr, macAddr);
    expect(device.name, name);
  });


  test('Wearable.toJson works properly', (){
    Wearable device = new Wearable(
        macAddr: macAddr,
        name: name,
    );

    Map<String, dynamic> jsonDevice =
    { 'macAddr' : macAddr,
      'name' :  name,
    };

    expect(device.toJson(), jsonDevice);
  });

  test('Wearable.fromJson works properly', (){
    Map<String, dynamic> jsonDevice =
    { 'macAddr' : macAddr,
      'name' :  name,
    };

    Wearable device = Wearable.fromJson(jsonDevice);

    expect(device.macAddr, macAddr);
    expect(device.name, name);

  });

}