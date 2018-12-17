import 'package:flutter/material.dart';
import 'package:country_code_picker/country_code_picker.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';
import 'package:intl/intl.dart';
import 'package:track_me/styles/colors.dart';


class RegisterPage extends StatefulWidget {
  static String tag = 'register-page';

  _RegisterPageState createState() => new _RegisterPageState();


}

class _RegisterPageState extends State<RegisterPage> {
  int _radioValue;
  String _ssn;
  String _name;
  String _surname;
  String _sex;
  DateTime _birthdate;
  String _state;
  String _region;
  String _city;
  String _zipcode;
  String _street;
  String _streetNr;
  String _email;
  String _password;

  void _handleRadioValueChange(int value) {

    setState(() {
      print(value);
      _radioValue = value;

      switch(_radioValue) {
        case 0:
          _sex = 'male';
          break;
        case 1:
          _sex = "female";
          break;
      }
      print(_sex + ' ' + _radioValue.toString());
    });
  }


  @override
  Widget build(BuildContext context) {





    final dateFormat = DateFormat("EEEE, MMMM d, yyyy");

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

    final SSN = TextFormField(

      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      onSaved: (email) => _ssn = email,
      initialValue: null,
      validator: (value) => value.isEmpty ? 'SSN can\'t be empy': null,
      decoration: InputDecoration(
          labelText: 'SSN',

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
            onPressed: null,
            child: Center(
              child: Text(
                'SEND',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Roboto'),
              ),
            ),
          ),
        ));
    return Material(
      child: Scaffold(
        backgroundColor: Colors.white,
        body: Padding(
          padding: const EdgeInsets.all(32.0),
          child: ListView(
            shrinkWrap: true,
            children: <Widget>[
              email,
              password,
              SSN,
              Row(
                children: <Widget>[
                  customTextFormField(_name, '', 'Name'),
                  SizedBox(width: 16.0),
                  customTextFormField(_surname, '', 'Surname' )

                ],
              ),
              Row(
                children: <Widget>[
                  Expanded(
                    child: DateTimePickerFormField(
                      dateOnly: true,
                      format: dateFormat,
                      decoration: InputDecoration(labelText: 'Birth Date'),
                      onChanged: (dt) => setState(() => _birthdate = dt),
                    ),
                  ),
                  SizedBox(width: 16.0,),
                  new Radio(
                      value: 0,
                      groupValue: _radioValue,
                      onChanged: _handleRadioValueChange,
                  ),
                  Text(
                    'Male'
                  ),
                  new Radio(
                      value: 1,
                      groupValue: _radioValue,
                      onChanged: _handleRadioValueChange,
                  ),
                  Text(
                    'Female'
                  )

                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 32.0),
                    child: new CountryCodePicker(
                      onChanged: print,
                      initialSelection: 'Italia',
                    ),
                  ),
                ),
                  customTextFormField(_region, '', 'Region')
                ],
              ),
              TextFormField(

                keyboardType: TextInputType.text,
                autofocus: false,
                onSaved: (city) => _city = city,
                initialValue: null,
                validator: (value) => value.isEmpty ? 'City can\'t be empy': null,
                decoration: InputDecoration(
                    labelText: 'City',

                    contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                    border: UnderlineInputBorder()),
              ),
              Row(
                children: <Widget>[
                  customTextFormField(_street, '', 'Street'),
                  SizedBox(width: 16.0,),
                  Container(
                    width: 60,
                    child: TextFormField(
                      autofocus: false,
                      initialValue: null,
                      validator: (value) => value.isEmpty ? 'Street Number can\'t be empy': null,
                      keyboardType: TextInputType.number,
                      onSaved:(streetNumber) => _streetNr = streetNumber,
                        decoration: InputDecoration(
                            labelText: 'N.',
                            contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                            border: UnderlineInputBorder()
                        )

                    ),
                  ),
                  SizedBox(width: 16.0,),
                  Container(
                    width: 80,
                    child: TextFormField(
                        autofocus: false,
                        initialValue: null,
                        validator: (value) => value.isEmpty ? 'zip code can\'t be empy': null,
                        keyboardType: TextInputType.number,
                        onSaved:(streetNumber) => _zipcode = streetNumber,
                        decoration: InputDecoration(
                            labelText: 'Zip',
                            contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                            border: UnderlineInputBorder())

                    ),
                  )
                ],
              ),
            SizedBox(height: 32.0),
            loginButton
            ],
          ),

        ),
      ),
    );



  }

  Expanded customTextFormField(var target,String initialValue,String labelTex) {
    return new Expanded(
        child: TextFormField(

          keyboardType: TextInputType.emailAddress,
          autofocus: false,
          onSaved: (email) => target = email,
          initialValue: initialValue,
          validator: (value) => value.isEmpty ? '$labelTex can\'t be empy': null,
          decoration: InputDecoration(
              labelText: labelTex,

              contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
              border: UnderlineInputBorder()),
        )
    );




  }

}

