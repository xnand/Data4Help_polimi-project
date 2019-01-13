import 'package:flutter/material.dart';
import 'package:trackmemobile/styles/texts.dart';

class FeedPage extends StatefulWidget {
  static String tag = 'feed-page';
  @override
  _FeedPageState createState() => new _FeedPageState();
  Widget build(BuildContext context) {}
}

class _FeedPageState extends State<FeedPage> {
  Widget build(BuildContext context) {
    return Scaffold(

      body: Center(
        child: new FeedTileWearable("SAMSUNG GEAR", "BLABLA"),
      ),
    );
  }
}

abstract class FeedTile extends StatelessWidget {
  String _name;
  String _imageUrl;

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
    assert(debugCheckHasMaterial(context));
    return Material(
      child: Padding(
        padding: const EdgeInsets.only(top: 64, right: 16.0, left: 16.0),
        child: Container(
          alignment: Alignment.center,
          child: Column(
            children: <Widget>[

              Text("Welcome to TrackMe app", style:textStyles['title_text']),
              SizedBox(height: 8),
              Text("in this demo you can :", style: textStyles['title_text'],),
              SizedBox(height: 32),
              Text("- register a user", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- register WearOS devices", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- delete WearOS devices", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- visualize company requests", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- accept/refuse requests", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- monitor WearOS simulator data", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- change wearOS sended data", style: textStyles['normal_text'],),
              SizedBox(height: 8),
              Text("- simulate an emergency packet", style: textStyles['normal_text'],),
              SizedBox(height: 32),
              Text("Sharing page -->", style:textStyles['title_text']),
              SizedBox(height: 8),
              Text("<-- Devices page", style:textStyles['title_text']),
            ],
          ),
        ),
      ),
    );
  }
}

class FeedTileRequest extends FeedTile {
  String _companyType;
  String _requestID;
  FeedTileRequest(String companyName, String companyType, String requestID)
      : super(companyName) {
    this._companyType = companyType;
    this._requestID = requestID;
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return null;
  }
}
