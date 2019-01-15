import 'package:flutter/material.dart';
import 'package:trackmemobile/styles/colors.dart';
import 'package:trackmemobile/controllers/channelController.dart';
import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/ProfileManager/network.dart';

class AddDevicePage extends StatefulWidget {
  @override
  _AddDevicePage createState() => new _AddDevicePage();





}

class _AddDevicePage extends State<AddDevicePage> {
  final formKey = new GlobalKey<FormState>();
  final scaffoldKey = new GlobalKey<ScaffoldState>();
  String _macAddr = "";
  String _name = "";
  ChannelController chCtrll = new ChannelController();
  bool _isLoading = false;


  void validateAndSave() async {
    final form = formKey.currentState;
    if(form.validate() && _macAddr != "") {
      _isLoading = true;
      ApiResponse response = await apiManager().registerWearable(_macAddr, _name);
      if(response.apiError == 'noError') {
        Navigator.of(context).pushNamed('/devicePage');
      } else {

        final scaffold = scaffoldKey.currentState;
        scaffold.showSnackBar(SnackBar(content: Text(response.apiError)));
      }
    } else {

    }
    setState(() {
      _isLoading = false;
    });
  }

  @override
  void initState() {

    chCtrll.getMacAddr().then((macAddres) => setState(() {
      _macAddr = macAddres;

    }));
  }

    @override
    Widget build(BuildContext context) {

      var page = Scaffold(
        key: scaffoldKey,
        backgroundColor: colorStyles['primary_pink'],
        body: Container(
          padding: EdgeInsets.all(32.0),
          alignment: Alignment.center,
          child: Form(
              key: formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: <Widget>[
                  Text(
                    _macAddr == null ? "no device connected, check your device or WearOS app..." :"device MAC : $_macAddr",
                    style: TextStyle(color: Colors.white, fontSize: 22),
                  ),
                  SizedBox(height: 50),
                  TextFormField(
                    onSaved: (value) => _name = value,
                    validator: (value) => value.isEmpty ? "device name can't be empty" : null,
                    decoration: InputDecoration(

                      fillColor: Colors.white,
                      labelText: "choose a name",
                      contentPadding: EdgeInsets.fromLTRB(20.0, 10.0, 20.0, 10.0),
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                  SizedBox(height: 50),
                  Container(
                      height: 40,
                      child: Material(
                        borderRadius: BorderRadius.circular(20),
                        shadowColor: Colors.green,
                        color: Colors.white,
                        elevation: 7.0,
                        child: FlatButton(
                          color: Colors.transparent,
                          onPressed: validateAndSave,
                          child: Center(
                            child: Text(
                              'CONFIRM',
                              style: TextStyle(
                                  color: colorStyles['primary_pink'],
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Roboto'),
                            ),
                          ),
                        ),
                      ))
                ],
              )),
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
