import 'package:flutter/material.dart';

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
        padding: const EdgeInsets.only(top: 8.0, right: 8.0),
        child: Container(
          height: 200,
          width: 300,
          alignment: Alignment.center,
          child: Card(
            child: Column(
              children: <Widget>[
                Image.network(
                  'https://raw.githubusercontent.com/flutter/website/master/src/_includes/code/layout/lakes/images/lake.jpg',
                  width: 150,
                  height: 150,
                ),
                Text("$_name is : ")

              ],
            ),
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
