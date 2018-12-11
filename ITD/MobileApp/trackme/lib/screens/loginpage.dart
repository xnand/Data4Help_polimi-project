import 'package:flutter/material.dart';
import 'package:track_me/styles/colors.dart';
import 'package:track_me/screens/feed.dart';
import 'PageNavigator.dart';
class LoginPage extends StatefulWidget {

  static String tag = 'login-page';
  @override

  _LoginPageState createState() => new _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  @override
  Widget build(BuildContext context) {
    final logo = Hero(
      tag: 'hero',
      child: CircleAvatar(
        backgroundColor: Colors.transparent,
        radius: 48,
        child: Image.asset('assets/icons/logo.png'),
      ),
    );

    final email = TextFormField(
      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      initialValue: null,
      decoration: InputDecoration(
          hintText: 'Email',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final password = TextFormField(
      autofocus: false,
      initialValue: null,
      obscureText: true,
      decoration: InputDecoration(
          hintText: 'Password',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final loginButton = Padding(
        padding: EdgeInsets.symmetric(vertical: 16.0),
        child: Material(
          shadowColor: Colors.greenAccent.shade200,
          elevation: 5.0,
          child: MaterialButton(
            minWidth: 200.0,
            height: 48.0,
            onPressed: () {
              Navigator.of(context).pushNamed(PageNavigator.tag);
            },
            color: colorStyles['button_green'],
            child: Text(
              'log In',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ));

    final forgotLabel = FlatButton(
      child: Text(
        'Forgot password ?',
        style: TextStyle(color: Colors.black54),
      ),
      onPressed: () {},
    );

    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: ListView(
          shrinkWrap: true,
          padding: EdgeInsets.only(left: 24.0, right: 24),
          children: <Widget>[
            logo,
            SizedBox(height: 48.0),
            email,
            SizedBox(height: 8),
            password,
            SizedBox(height: 48.0),
            loginButton,
            forgotLabel,
          ],
        ),
      ),
    );
  }
}
