import 'package:flutter/material.dart';
import 'package:trackmemobile/ProfileManager/network.dart';
import 'package:trackmemobile/utils/countryCodePicker/country_code_picker.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';
import 'package:intl/intl.dart';
import 'package:trackmemobile/styles/colors.dart';
import 'package:trackmemobile/models/user.dart';
import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/utils/validators.dart';

class RegisterPage extends StatefulWidget {


  _RegisterPageState createState() => new _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  int _radioValue;
  String _ssn;
  String _name;
  String _surname;
  String _sex;
  DateTime _birthdate;
  String _parsedDate;
  String _country;
  String _region;
  String _city;
  String _zipcode;
  String _street;
  String _streetNr;
  String _email;
  String _password;
  bool _isLoading;

  @override
  void initState() {
    _isLoading = false;
  }

  final formKey = new GlobalKey<FormState>();
  final scaffoldKey = new GlobalKey<ScaffoldState>();

  //this function transform the date gathered from the widget to the API specification request date
  void parseDate(DateTime date) {
    List<String> dateFiltered =
        date.toString().split(' ').elementAt(0).split(new RegExp(r"-"));
    if (dateFiltered.length == 3) {
      _parsedDate = dateFiltered.elementAt(1) +
          ' ' +
          dateFiltered.elementAt(2) +
          ' ' +
          dateFiltered.elementAt(0);
    }
    print(_parsedDate);
  }

  void _handleRadioValueChange(int value) {
    setState(() {
      print(value);
      _radioValue = value;

      switch (_radioValue) {
        case 0:
          _sex = 'male';
          break;
        case 1:
          _sex = "female";
          break;
      }
    });
  }

  Function loginPressed() {
    return _isLoading ? null : () {
      saveAndSubmit();
    };

  }
  void saveAndSubmit() async{
    setState(() {
      _isLoading = true;
    });
    final form = formKey.currentState;
    if(form.validate()) {
      form.save();
      User user = new User(
          ssn: _ssn.trim(),
          name: _name.trim(),
          surname: _surname.trim(),
          sex: _sex.trim(),
          birthDate: _parsedDate.trim(),
          country: _country.trim(),
          region: _region.trim(),
          city: _city.trim(),
          zipcode: _zipcode.trim(),
          street: _street.trim(),
          streetNr: _streetNr.trim(),
          email: _email.trim(),
          password: _password.trim()
      );

      print(userToJson(user));
      ApiResponse response = await apiManager().registerUser(user);
      if(response.apiError == 'noError') {
        Navigator.of(context).pushNamed('/login');
      }
        else{
          final scaffold = scaffoldKey.currentState;
          scaffold.showSnackBar(SnackBar(content: Text(response.apiError)));
      }

    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat("dd/MM/yyyy");

    final email = TextFormField(
      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      onSaved: (email) => _email = email,
      initialValue: 'testmail@gmail.it',
      validator: EmailFIeldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Email',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final password = TextFormField(
      autofocus: false,
      initialValue: 'testpsw',
      obscureText: true,
      validator: PasswordFieldValidator.validate,
      onSaved: (password) => _password = password,
      decoration: InputDecoration(
          labelText: 'Password',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    final SSN = TextFormField(
      keyboardType: TextInputType.emailAddress,
      autofocus: false,
      onSaved: (ssn) => _ssn = ssn,
      initialValue: null,
      validator: (value) => value.isEmpty ? 'SSN can\'t be empy' : null,
      decoration: InputDecoration(
          labelText: 'SSN',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    );

    Expanded countryCodePicker = Expanded(
      child: Padding(
        padding: const EdgeInsets.only(top: 32.0),
        child: CountryCodePicker(
          onChanged: (country) => _country = country.name,
          initialSelection: 'Italia',
        ),
      ),
    );

    final nameField = Expanded(
        child: TextFormField(
      keyboardType: TextInputType.text,
      autofocus: false,
      onSaved: (name) => _name = name,
      initialValue: null,
      validator: NameFieldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Name',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    ));

    final surnameField = Expanded(
        child: TextFormField(
      keyboardType: TextInputType.text,
      autofocus: false,
      onSaved: (surname) => _surname = surname,
      initialValue: null,
      validator: SurnameFieldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Surname',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    ));

    final streetField = Expanded(
        child: TextFormField(
      keyboardType: TextInputType.text,
      autofocus: false,
      onSaved: (street) => _street = street,
      initialValue: null,
      validator: StreetFieldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Street',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    ));

    final regionField = Expanded(
        child: TextFormField(
      keyboardType: TextInputType.text,
      autofocus: false,
      onSaved: (region) => _region = region,
      initialValue: null,
      validator: RegionFieldValidator.validate,
      decoration: InputDecoration(
          labelText: 'Region',
          contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
          border: UnderlineInputBorder()),
    ));

    final loginButton = Container(
        height: 40,
        child: Material(
          borderRadius: BorderRadius.circular(20),
          shadowColor: Colors.green,
          color: colorStyles['button_green'],
          elevation: 7.0,
          child: FlatButton(
            color: Colors.transparent,
            onPressed: loginPressed(),
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


    var page = Material(
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: Colors.white,
        body: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Form(
            key: formKey,
            child: ListView(
              shrinkWrap: true,
              children: <Widget>[
                email,
                password,
                SSN,
                Row(
                  children: <Widget>[
                    nameField,
                    SizedBox(width: 16.0),
                    surnameField,
                  ],
                ),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: DateTimePickerFormField(
                        dateOnly: true,
                        format: dateFormat,
                        decoration: InputDecoration(labelText: 'Birth Date'),
                        onChanged: (dt) => setState(() {
                              _birthdate = dt;
                              parseDate(_birthdate);
                            }),
                      ),
                    ),
                    SizedBox(
                      width: 16.0,
                    ),
                    new Radio(
                      value: 0,
                      groupValue: _radioValue,
                      onChanged: _handleRadioValueChange,
                    ),
                    Text('Male'),
                    new Radio(
                      value: 1,
                      groupValue: _radioValue,
                      onChanged: _handleRadioValueChange,
                    ),
                    Text('Female')
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    countryCodePicker,
                    regionField,
                  ],
                ),
                TextFormField(
                  keyboardType: TextInputType.text,
                  autofocus: false,
                  onSaved: (city) => _city = city,
                  initialValue: null,
                  validator: (value) =>
                      value.isEmpty ? 'City can\'t be empy' : null,
                  decoration: InputDecoration(
                      labelText: 'City',
                      contentPadding:
                          EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: UnderlineInputBorder()),
                ),
                Row(
                  children: <Widget>[
                    streetField,
                    SizedBox(
                      width: 16.0,
                    ),
                    Container(
                      width: 60,
                      child: TextFormField(
                          autofocus: false,
                          initialValue: null,
                          validator: (value) => value.isEmpty
                              ? 'Street Number can\'t be empy'
                              : null,
                          keyboardType: TextInputType.number,
                          onSaved: (streetNumber) => _streetNr = streetNumber,
                          decoration: InputDecoration(
                              labelText: 'N.',
                              contentPadding:
                                  EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                              border: UnderlineInputBorder())),
                    ),
                    SizedBox(
                      width: 16.0,
                    ),
                    Container(
                      width: 80,
                      child: TextFormField(
                          autofocus: false,
                          initialValue: null,
                          validator: (value) =>
                              value.isEmpty ? 'zip code can\'t be empy' : null,
                          keyboardType: TextInputType.number,
                          onSaved: (zipcode) => _zipcode = zipcode,
                          decoration: InputDecoration(
                              labelText: 'Zip',
                              contentPadding:
                                  EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                              border: UnderlineInputBorder())),
                    )
                  ],
                ),
                SizedBox(height: 32.0),
                loginButton,
                SizedBox(height: 16.0),
                Text(
                    'by clicking SEND you accept TrackMe \'s terms and conditions',
                    style: new TextStyle(
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        fontFamily: 'Roboto')),
              ],
            ),
          ),
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

    return _isLoading ? whenLoading : page;
  }
}
