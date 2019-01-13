import 'package:flutter/material.dart';
import 'screens/loginpage.dart';
import 'screens/feed.dart';
import 'screens/PageNavigator.dart';
import 'screens/sharingPage.dart';
import 'screens/registerPage.dart';
import 'screens/addDevicePage.dart';
import 'package:flutter/services.dart';

void main() {
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp, DeviceOrientation.portraitDown])
      .then((_) {
    runApp(new TrackMe());
  });

}

class TrackMe extends StatelessWidget {


  final routes = <String, WidgetBuilder>{
    '/login': (context) =>LoginPage(),
    '/feed': (context) =>FeedPage(),
    '/navigator': (context) => PageNavigator(),
    '/sharing': (context) => SharingPage(),
    '/register': (context) => RegisterPage(),
    '/addDevice' : (context) => AddDevicePage()

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