import 'package:flutter/material.dart';
import 'package:trackmemobile/ProfileManager/network.dart';
import 'package:trackmemobile/styles/colors.dart';

import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/controllers/channelController.dart';
import 'package:trackmemobile/utils/validators.dart';
import 'PageNavigator.dart';



class LoginPage extends StatefulWidget {


  @override
  _LoginPageState createState() => new _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String _email;
  String _password;
  final formKey = new GlobalKey<FormState>();
  final scaffoldKey = new GlobalKey<ScaffoldState>();
  bool _isButtonDisabled;

  @override
  void initState() {
    _isButtonDisabled = false;
  }

  Function loginPressed() {
    if(_isButtonDisabled) return null;
    else return () {
      validateAndSave();
    };
  }

  void validateAndSave() async {
    final form = formKey.currentState;


    if(form.validate()) {
      setState(() {
        _isButtonDisabled = true;
      });
      form.save();
      ApiResponse response = await apiManager().login(_email, _password);

      if(response.apiError == 'noError') {
        ChannelController chCtrll = new ChannelController();
        chCtrll.startPacketManagerService();
        Navigator.of(context).pushReplacementNamed('/navigator');
      }
        else {
              setState(() {
                _isButtonDisabled = false;
              });
              final scaffold = scaffoldKey.currentState;
              scaffold.showSnackBar(SnackBar(content: Text(response.apiError)));
        }

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
      key: Key('emailField'),
      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      onSaved: (email) => _email = email,
      initialValue: '',
      validator: EmailFIeldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Email',

          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final password = TextFormField(
      key: Key('passwordField'),
      autofocus: false,
      initialValue: '',
      obscureText: true,
      validator: PasswordFieldValidator.validate,
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
            key: Key('loginButton'),
            color: Colors.transparent,
            onPressed: loginPressed(),
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
                key: Key('registerButton'),
                splashColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onPressed: () {
                  Navigator.of(context).pushNamed('/register');
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
        Navigator.of(context).pushNamed('/register');
      },
    );

    var page = Scaffold(
      key: scaffoldKey,
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
    var whenLoading = new Container(
      child: new Stack(
        children: <Widget>[
          page,
          new Container(
            alignment: AlignmentDirectional.center,
            decoration: new BoxDecoration(
              color: Colors.white70,
            ),
            child: Center(
              child: new Container(
                child: Center(
                  child: SizedBox(
                    height: 80,
                    width: 80,
                    child: CircularProgressIndicator(
                      strokeWidth: 10,
                      valueColor: AlwaysStoppedAnimation<Color>(colorStyles['primary_pink'])),
                  ),
                ),
                width: 300,
                height: 200,
                decoration: new BoxDecoration(
                  color: colorStyles[Colors.white],
                  borderRadius: BorderRadius.circular(18.0)
                ),

              ),
            ),
          )
        ],
      ),
    );
    return _isButtonDisabled ? whenLoading : page;
  }
}
