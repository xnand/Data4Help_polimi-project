import 'package:flutter/material.dart';
import 'screens/loginpage.dart';
import 'screens/feed.dart';
import 'screens/PageNavigator.dart';
import 'screens/sharingPage.dart';

void main() => runApp(TrackMe());

class TrackMe extends StatelessWidget {

  final routes = <String, WidgetBuilder>{
    LoginPage.tag: (context) =>LoginPage(),
    FeedPage.tag: (context) =>FeedPage(),
    PageNavigator.tag: (context) => PageNavigator(),
    SharingPage.tag: (context) => SharingPage()
  };
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TrackMe',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.lightBlue,
        fontFamily: 'Roboto'
      ),
      home: LoginPage(),
      routes: routes,
    );
  }
}