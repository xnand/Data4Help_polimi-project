import 'package:flutter/material.dart';

class FeedPage extends StatefulWidget {
  static String tag = 'feed-page';
  @override

  _FeedPageState createState() => new _FeedPageState();
  Widget build(BuildContext context) {



  }


}



class _FeedPageState extends State<FeedPage> {



  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green,
      body: Center(

      ),
    );
  }


}

abstract class FeedTile extends StatelessWidget  {
  String _name;
  var _image;

  FeedTile(String title) {
    this._name = title;
  }
}

class FeedTileWearable extends FeedTile {
  String _macAddr;
  FeedTileWearable(String name, String macAddr) : super(name) {
    this._macAddr = macAddr;
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return null;
  }
}

class FeedTileRequest extends FeedTile {
  String _companyType;
  String _requestID;
  FeedTileRequest(String companyName, String companyType, String requestID ) : super(companyName) {
    this._companyType = companyType;
    this._requestID = requestID;
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return null;
  }
}
