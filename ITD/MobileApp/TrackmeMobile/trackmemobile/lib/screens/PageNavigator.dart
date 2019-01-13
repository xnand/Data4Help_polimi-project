import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'feed.dart';
import 'settings.dart';
import 'automatedSOS.dart';
import 'devicesPage.dart';
import 'track4run.dart';
import 'package:trackmemobile/styles/colors.dart';
import 'package:trackmemobile/controllers/profileManager.dart';
import 'package:trackmemobile/controllers/channelController.dart';

class PageNavigator extends StatefulWidget {

  @override

  _PageNavigatorState createState() => new _PageNavigatorState();

}

class _PageNavigatorState extends State<PageNavigator> {
  final platform =   MethodChannel('com.trackme.trackmemobile/packet');
  int _currentIndex = 2;
  bool isInit = false;

  final List<Widget> _children = [
    DevicesPage(),
    Track4RunPage(),
    FeedPage(),
    AutomatedSOSPage(),
    SettingPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: _children[_currentIndex],
      bottomNavigationBar: new BottomNavigationBar(
          onTap: onTabTapped,
          currentIndex: _currentIndex,
          type: BottomNavigationBarType.fixed,
          iconSize: 32.0,
          fixedColor: colorStyles['primary_pink'],

          items: [
            BottomNavigationBarItem(
                icon: new Icon(Icons.devices),
                title: new Text('')
            ),
            BottomNavigationBarItem(
                icon: new Icon(Icons.directions_run),
                title: new Text('')
            ),
            BottomNavigationBarItem(
                icon: new Icon(Icons.home),
                title: new Text('')
            ),
            BottomNavigationBarItem(
                icon: new Icon(Icons.healing),
                title: new Text('')
            ),
            BottomNavigationBarItem(
                icon: new Icon(Icons.settings),
                title: new Text('')
            ),



          ]),
    );
  }

  void onTabTapped(int index) async {
    if(isInit == false) {

//      platform.invokeMethod('setupPacketHandler');
//      const oneSec = Duration(milliseconds: 1000);
//      new Timer.periodic(oneSec, (Timer t) => platform.invokeMethod('getMessage'));
//      print("no i sleep");
//    platform.invokeMethod("startService", <String, String> {
//      'SSN' : await ProfileManager().getSSN(),
//      'email' : await ProfileManager().getEmail(),
//      'password' : await ProfileManager().getPassword()
//    });



    }
    setState(() {
      isInit = true;
      _currentIndex = index;

      // call java method to set up packet handler

    });



  }
}