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
  bool isDeleting = false;

  void deleteWearable(String macAddr) {

  }

  void abort() {
    setState(() {
      isDeleting = false;
    });
  }

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
                setState(() {
                  isDeleting = true;
                });
              },
              child: item);
        });
  }

  @override
  Widget build(BuildContext context) {
    var wearableListFuture = new FutureBuilder(
      future: apiManager().getWearableDevice(),
      builder: (BuildContext context, AsyncSnapshot snapshot) {
        switch (snapshot.connectionState) {
          case ConnectionState.none: //TODO what happen ?
          case ConnectionState.waiting:
            return new Center(
              child: CircularProgressIndicator(
                valueColor:
                    AlwaysStoppedAnimation<Color>(colorStyles['primary_pink']),
              ),
            );
          default:
            if (snapshot.hasError)
              return new Text('Error: ${snapshot.error}');
            else
              return createListView(context, snapshot);
        }
      },
    );

    var page = Scaffold(
        body: Container(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: <Widget>[
            new Text('Your devices', style: textStyles['title_text']),
            SizedBox(
              height: 32.0,
            ),
            wearableListFuture,
          ],
        ),
      ),
    ));
    var popUpButtons =  Column(
      children: <Widget>[
        SizedBox(
          height: 80,
        ),

        Center(
          child: Text('Are you sure?', style: textStyles['normal_text'],),
        ),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Container(
                  height: 40,
                  width: 150,
                  child: Material(
                    borderRadius: BorderRadius.circular(20),
                    shadowColor: Colors.green,
                    color: colorStyles['button_green'],
                    elevation: 7.0,
                    child: FlatButton(
                      color: Colors.transparent,
                      onPressed: null,
                      child: Center(
                        child: Text(
                          'CONFIRM',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Roboto'),
                        ),
                      ),
                    ),
                  )),
              SizedBox(
                width: 20,
              ),
              Container(
                  height: 40,
                  width: 150,
                  child: Material(
                    borderRadius: BorderRadius.circular(20),
                    shadowColor: Colors.green,
                    color: colorStyles['button_green'],
                    elevation: 7.0,
                    child: FlatButton(
                      color: Colors.transparent,
                      onPressed: abort,
                      child: Center(
                        child: Text(
                          'ABORT',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Roboto'),
                        ),
                      ),
                    ),
                  )),
            ],
          ),
        ),
        SizedBox(
          height: 40,
        )
      ],
    );
    var confirmation = new Stack(
      children: <Widget>[
        page,
        Container(
          alignment: AlignmentDirectional.center,
          decoration: new BoxDecoration(
            color: Colors.white70
          ),
        ),
        Center(
          child: new Container(
            height: 250,
            width: 350,
            child: Material(
              borderRadius: BorderRadius.circular(20),
              shadowColor: Colors.black,
              elevation: 10.0,
              child: popUpButtons,

            ),
          ),
        )
      ],
    );


    return isDeleting ? confirmation : page;
  }
}

class deviceTile extends StatelessWidget {
  String deviceName;
  Image deviceImage; //TODO how does server send images ?
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
                        deviceName,
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
