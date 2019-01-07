import 'package:flutter/material.dart';
import 'package:track_me/styles/colors.dart';
import 'package:track_me/styles/texts.dart';
import 'package:track_me/networkManager/network.dart';
import 'package:track_me/models/request.dart';
import 'package:track_me/models/apiResponse.dart';

class DevicesPage extends StatefulWidget {
  static String tag = "devices-page";

  @override
  _DevicesPageState createState() => new _DevicesPageState();
}

class _DevicesPageState extends State<DevicesPage> {



  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return null;
  }
}

class deviceTile extends StatelessWidget {
String deviceName;
Image deviceImage; //TODO how does server send images ?
String deviceType;
String macAddress;

deviceTile(String deviceName, String deviceType, String macAddress) {
  this.deviceName = deviceName;
  this.deviceType = deviceType;
  this.macAddress = macAddress;
}

@override
Widget build(BuildContext context) {
  assert(debugCheckHasMaterial(context));
  return Material(
    child: Padding(
      padding:
      const EdgeInsets.only(left: 0.0, right: 0.0, top: 8.0, bottom: 0.0),
      child: Container(
        child: Center(
          child: Card(
              child: Row(
                children: <Widget>[
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: CircleAvatar(
                      backgroundColor: Colors.blue,
                      radius: 36,
                      child: Image.asset('assets/icons/logo.png'),
                    ),
                  ),
                  new Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: <Widget>[
                        new Text(
                          deviceName,
                          style: new TextStyle(
                            fontFamily: 'Roboto',
                            color: Colors.black,
                            fontWeight: FontWeight.w500,
                            fontSize: 16.0,
                          ),
                        ),
                        new Text(
                          deviceType,
                          style: new TextStyle(
                            color: Colors.grey,
                            fontWeight: FontWeight.w400,
                            fontFamily: 'Roboto',
                            fontSize: 14.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              )),
        ),
      ),
    ),
  );
}

refuse() {
  print('refused!');
}
}