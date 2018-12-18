import 'package:flutter/material.dart';
import 'package:track_me/styles/colors.dart';
import 'package:track_me/networkManager/network.dart';
import 'package:track_me/controllers/profileManager.dart';
import 'registerPage.dart';
import 'package:track_me/models/apiResponse.dart';
import 'package:track_me/screens/PageNavigator.dart';

import 'PageNavigator.dart';

class LoginPage extends StatefulWidget {
  static String tag = 'login-page';

  @override
  _LoginPageState createState() => new _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String _email;
  String _password;
  final formKey = new GlobalKey<FormState>();

  void validateAndSave() async {
    final form = formKey.currentState;


    if(form.validate()) {
      form.save();
      ApiResponse response = await apiManager().login(_email, _password);

      if(response.apiResponse == '') Navigator.of(context).pushNamed(PageNavigator.tag);
      else print(response.apiResponse);
    }
  }
  _LoginPageState();
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
      onSaved: (email) => _email = email,
      initialValue: 'testmail@gmail.it',
      validator: (value) => value.isEmpty ? 'Email can\'t be empy': null,
      decoration: InputDecoration(
          labelText: 'Email',

          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final password = TextFormField(
      autofocus: false,
      initialValue: 'testpsw',
      obscureText: true,
      validator: (value) => value.isEmpty ? 'Password can\'t be empy': null,
      onSaved: (password) => _password = password,
      decoration: InputDecoration(
          labelText: 'Password',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final loginButton = Container(
        height: 40,
        child: Material(
          borderRadius: BorderRadius.circular(20),
          shadowColor: Colors.green,
          color: colorStyles['button_green'],
          elevation: 7.0,
          child: FlatButton(
            color: Colors.transparent,
            onPressed: validateAndSave,
            child: Center(
              child: Text(
                'LOGIN',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Roboto'),
              ),
            ),
          ),
        ));

    final registrationButton = Container(
        height: 40,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text('new to trackMe ? ',
              style: TextStyle(
                color: colorStyles['text_color'],
                fontFamily: 'Roboto',
                fontWeight: FontWeight.w700
              ) ,
            ),
            Material(
              borderRadius: BorderRadius.circular(20),

              color: Colors.transparent,
              elevation: 0,

              child: FlatButton(

                splashColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onPressed: () {
                  Navigator.of(context).pushNamed(RegisterPage.tag);
                },
                child: Center(
                  child: Text(
                    'REGISTER',
                    style: TextStyle(
                        color: colorStyles['primary_pink'],
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Roboto'),
                  ),
                ),
              ),
            )
          ],
        )
    );

    final forgotLabel = FlatButton(
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Text(
        'Forgot Password',
        style: TextStyle(
          color: colorStyles['button_green'],
          fontWeight: FontWeight.bold,
          fontSize: 14.0

        ),
      ),
      onPressed: () {
        Navigator.of(context).pushNamed(RegisterPage.tag);
      },
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
            Form(
              key: formKey,
              child: Column(
                children: <Widget>[
                  email,
                  password
                ],
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                forgotLabel,
              ],
            ),
            SizedBox(height: 48.0),
            loginButton,
            SizedBox(height: 16.0),
            registrationButton,

          ],
        ),
      ),
    );
  }
}
