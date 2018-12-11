import 'package:flutter/material.dart';
import 'feed.dart';
import 'settings.dart';
import 'automatedSOS.dart';
import 'devices.dart';
import 'track4run.dart';

class PageNavigator extends StatefulWidget {
  static String tag = 'navigator';
  @override

  _PageNavigatorState createState() => new _PageNavigatorState();

}

class _PageNavigatorState extends State<PageNavigator> {

  int _currentIndex = 2;
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

  void onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }
}