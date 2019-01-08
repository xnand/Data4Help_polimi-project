import 'package:flutter/material.dart';
import 'package:track_me/styles/colors.dart';
import 'package:track_me/styles/texts.dart';
import 'package:track_me/networkManager/network.dart';
import 'package:track_me/models/request.dart';
import 'package:track_me/models/apiResponse.dart';
import 'package:track_me/models/device.dart';

class DevicesPage extends StatefulWidget {
  @override
  _DevicesPageState createState() => new _DevicesPageState();
}

class _DevicesPageState extends State<DevicesPage> {

  Widget createListView(BuildContext context, AsyncSnapshot snapshot) {
    List<Wearable> wearablesList = snapshot.data;

    return new ListView.builder(
        scrollDirection: Axis.vertical,
        shrinkWrap: true,
        physics: ClampingScrollPhysics(),
        itemCount: wearablesList.length,
        itemBuilder: (context, index) {
          final item = new deviceTile(wearablesList.elementAt(index).name,
              wearablesList.elementAt(index).macAddr);

          return Dismissible(
              // Show a red background as the item is swiped away
              movementDuration: Duration(seconds: 1),
              secondaryBackground: Padding(
                padding: EdgeInsets.only(top: 15, bottom: 5),
                child: Container(
                    alignment: Alignment.center,
                    padding: EdgeInsets.all(16.0),
                    color: Colors.greenAccent,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: CircleAvatar(
                            backgroundColor: Colors.transparent,
                            radius: 16,
                            child: Image.asset('assets/icons/check.png'),
                          ),
                        )
                      ],
                    )),
              ),
              background: Padding(
                padding: EdgeInsets.only(top: 15, bottom: 5),
                child: Container(
                    alignment: Alignment.center,
                    padding: EdgeInsets.all(16.0),
                    color: Color.fromRGBO(243, 20, 49, 0.5),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0),
                          child: CircleAvatar(
                            backgroundColor: Colors.transparent,
                            radius: 16,
                            child: Image.asset('assets/icons/cross.png'),
                          ),
                        )
                      ],
                    )),
              ),
              key: Key(item.macAddress),
              direction: DismissDirection.startToEnd,
              onDismissed: (direction) async {
                //delete device
              },
              child: item);
        });
  }
  @override
  Widget build(BuildContext context) {
    var wearableListFuture = new FutureBuilder(
      future: apiManager().getRequests(state: "pending"), //TODO change to the devices get
      builder: (BuildContext context, AsyncSnapshot snapshot) {
        switch (snapshot.connectionState) {
          case ConnectionState.none:
          case ConnectionState.waiting:
            return new Center(
              child: CircularProgressIndicator(),
            );
          default:
            if (snapshot.hasError)
              return new Text('Error: ${snapshot.error}');
            else
              return createListView(
                  context, snapshot);
        }
      },
    );
  }

}

class deviceTile extends StatelessWidget {
  String deviceName;
  Image deviceImage; //TODO how does server send images ?
  String deviceType;
  String macAddress;

  deviceTile(String deviceName, String macAddress) {
    this.deviceName = deviceName;
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
}
