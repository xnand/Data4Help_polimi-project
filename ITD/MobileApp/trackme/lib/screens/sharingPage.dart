import 'package:flutter/material.dart';
import 'package:track_me/styles/colors.dart';
import 'package:track_me/styles/texts.dart';

//testing lists
final activeRequestList = List<companyTileAccepted>.generate(
    6, (i) => companyTileAccepted('Name ${i + 1}', 'Type', 'date'));

final pendingRequestList = List<companyTileRequest>.generate(
    6, (i) => companyTileRequest('Name ${i + 1}', 'Type'));

class companyTileAccepted extends StatelessWidget {
  String companyName;
  Image companyImage; //TODO how does server send images ?
  String companyType;
  String sharingSince;

  companyTileAccepted(
      String companyName, String companyType, String sharingSince) {
    this.companyName = companyName;
    this.companyType = companyType;
    this.sharingSince = sharingSince;
  }
  @override
  Widget build(BuildContext context) {
    assert(debugCheckHasMaterial(context));
    return Material(
      child: Padding(
        padding:
            const EdgeInsets.only(left: 0.0, right: 0.0, top: 8.0, bottom: 0.0),
        child: Container(
          child: Center(
            child: Card(
                child: Row(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: CircleAvatar(
                    backgroundColor: Colors.blue,
                    radius: 36,
                    child: Image.asset('assets/icons/logo.png'),
                  ),
                ),
                new Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: <Widget>[
                      new Text(
                        companyName,
                        style: new TextStyle(
                          fontFamily: 'Roboto',
                          color: Colors.black,
                          fontWeight: FontWeight.w500,
                          fontSize: 16.0,
                        ),
                      ),
                      new Text(
                        companyType,
                        style: new TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w400,
                          fontFamily: 'Roboto',
                          fontSize: 14.0,
                        ),
                      ),
                      new Text(
                        'since: ' + sharingSince,
                        style: new TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w400,
                          fontFamily: 'Roboto',
                          fontSize: 14.0,
                        ),
                      )
                    ],
                  ),
                ),

              ],
            )),
          ),
        ),
      ),
    );
  }

  refuse() {
    print('refused!');
  }
}

class companyTileRequest extends StatelessWidget {
  String companyName;
  Image companyImage; //TODO how does server send images ?
  String companyType;

  companyTileRequest(String companyName, String companyType) {
    this.companyName = companyName;
    this.companyType = companyType;
  }

  accept() {
    print('accepted!');
  }

  @override
  Widget build(BuildContext context) {
    assert(debugCheckHasMaterial(context));
    return Material(
      child: Padding(
        padding:
            const EdgeInsets.only(left: 0.0, right: 0.0, top: 8.0, bottom: 0.0),
        child: Container(
          child: Center(
            child: Card(
                child: Row(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: CircleAvatar(
                    backgroundColor: Colors.blue,
                    radius: 36,
                    child: Image.asset('assets/icons/logo.png'),
                  ),
                ),
                new Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: <Widget>[
                      new Text(
                        companyName,
                        style: new TextStyle(
                          fontFamily: 'Roboto',
                          color: Colors.black,
                          fontWeight: FontWeight.w500,
                          fontSize: 16.0,
                        ),
                      ),
                      new Text(
                        companyType,
                        style: new TextStyle(
                          color: Colors.grey,
                          fontWeight: FontWeight.w400,
                          fontFamily: 'Roboto',
                          fontSize: 14.0,
                        ),
                      ),
                    ],
                  ),
                ),

              ],
            )),
          ),
        ),
      ),
    );
  }

  refuse() {
    print('refused!');
  }
}

//a widget that display a sharing request tile to the user
class SharingPage extends StatefulWidget {
  static String tag = 'sharing-page';
  @override
  _SharingPageState createState() => new _SharingPageState();
}

class _SharingPageState extends State<SharingPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Container(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: <Widget>[
            new Text('Pending requests', style: textStyles['title_text']),
            SizedBox(
              height: 32.0,
            ),
            ListView.builder(
                physics: ClampingScrollPhysics(),
                scrollDirection: Axis.vertical,
                shrinkWrap: true,
                itemCount: pendingRequestList.length,
                itemBuilder: (context, index) {
                  final item = pendingRequestList[index];
                  return Dismissible(
                      // Show a red background as the item is swiped away
                      secondaryBackground: Padding(
                        padding: EdgeInsets.only(top: 15, bottom: 5),
                        child: Container(
                            alignment: Alignment.center,
                            padding: EdgeInsets.all(16.0),
                            color: Colors.greenAccent,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                Padding(
                                  padding: const EdgeInsets.only(left: 16.0),
                                  child: CircleAvatar(
                                    backgroundColor: Colors.transparent,
                                    radius: 16,
                                    child: Image.asset('assets/icons/check.png'),
                                  ),
                                )
                              ],
                            )),
                      ),

                      background: Padding(
                        padding: EdgeInsets.only(top: 15, bottom: 5),
                        child: Container(
                            alignment: Alignment.center,
                            padding: EdgeInsets.all(16.0),
                            color: Color.fromRGBO(243, 20, 49, 0.5),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                Padding(
                                  padding: const EdgeInsets.only(left: 16.0),
                                  child: CircleAvatar(
                                    backgroundColor: Colors.transparent,
                                    radius: 16,
                                    child: Image.asset('assets/icons/cross.png'),
                                  ),
                                )
                              ],
                            )),

                      ),
                      key: Key(item.companyName),

                      onDismissed: (direction) {
                        setState(() {
                          if(direction == DismissDirection.endToStart) {

                          }
                          //delete request
                          item.refuse(); //this function modify the database
                          pendingRequestList.removeAt(index);
                          
                        });

                        Scaffold.of(context).showSnackBar(SnackBar(
                            content:
                                Text("${item.companyName} request dismissed")));
                      },
                      child: pendingRequestList[index]);
                }),
            SizedBox(height: 32.0),
            new Text(
              'Active requests',
              style: textStyles['title_text'],
            ),
            SizedBox(
              height: 32.0,
            ),
            ListView.builder(
                physics: ClampingScrollPhysics(),
                scrollDirection: Axis.vertical,
                shrinkWrap: true,
                itemCount: activeRequestList.length,
                itemBuilder: (context, index) {
                  final item = activeRequestList[index];
                  return Dismissible(
                      // Show a red background as the item is swiped away
                      background: Padding(
                        padding: EdgeInsets.only(top: 15, bottom: 5),
                        child: Container(
                            alignment: Alignment.center,
                            padding: EdgeInsets.all(16.0),
                            color: Color.fromRGBO(243, 20, 49, 0.5),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: <Widget>[
                                Padding(
                                  padding: const EdgeInsets.only(left: 16.0),
                                  child: CircleAvatar(
                                    backgroundColor: Colors.transparent,
                                    radius: 16,
                                    child: Image.asset('assets/icons/cross.png'),
                                  ),
                                )
                              ],
                            )),

                      ),
                      key: Key(item.companyName),
                      direction: DismissDirection.startToEnd,
                      onDismissed: (direction) {
                        setState(() {
                          //delete request
                          item.refuse(); //this function modify the database
                          activeRequestList.removeAt(index);
                        });

                        Scaffold.of(context).showSnackBar(SnackBar(
                            content:
                                Text("${item.companyName} request dismissed")));
                      },
                      child: activeRequestList[index]);
                })
          ],
        ),
      ),
    ));
  }
}
