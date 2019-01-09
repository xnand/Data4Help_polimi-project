import 'package:flutter/material.dart';
import 'package:trackmemobile/styles/colors.dart';
import 'package:trackmemobile/styles/texts.dart';
import 'package:trackmemobile/networkManager/network.dart';
import 'package:trackmemobile/models/request.dart';
import 'package:trackmemobile/models/apiResponse.dart';

class companyTileAccepted extends StatelessWidget {
  String companyName;
  Image companyImage; //TODO how does server send images ?
  String companyType;
  String sharingSince;

  companyTileAccepted(String companyName, String companyType, String sharingSince) {
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
  int id;

  companyTileRequest(String companyName, String companyType, int id) {
    this.companyName = companyName;
    this.companyType = companyType;
    this.id = id;
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
  Widget createListView(BuildContext context, AsyncSnapshot snapshot,
      DismissDirection direction) {
    DismissDirection dismissDirection = direction;
    List<Request> requestList = snapshot.data;

    return new ListView.builder(
        scrollDirection: Axis.vertical,
        shrinkWrap: true,
        physics: ClampingScrollPhysics(),
        itemCount: requestList.length,
        itemBuilder: (context, index) {
          final item = new companyTileRequest(
              requestList.elementAt(index).company.name, "type", index);
          return Dismissible(
              // Show a red background as the item is swiped away
              movementDuration: Duration(seconds: 1),
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
              direction: dismissDirection,
              onDismissed: (direction) async {
                //accepted request
                if (direction == DismissDirection.endToStart) {
                  ApiResponse response = await apiManager().acceptRequest(
                      requestList.elementAt(index).id.toString());

                  if (response.apiError == "noError") {
                    Scaffold.of(context).showSnackBar(SnackBar(
                        content: Text(
                            "${item.companyName} following request accepted")));
                  } else {
                    setState(() {
                      Scaffold.of(context).showSnackBar(SnackBar(
                        content: Text(response.apiError),
                      ));
                    });
                  }
                }
                //delete request
                else if (direction == DismissDirection.startToEnd) {
                  ApiResponse response = await apiManager().rejectRequest(
                      requestList.elementAt(index).id.toString());
                  if (response.apiError == "noError") {
                    Scaffold.of(context).showSnackBar(SnackBar(
                        content: Text(
                            "${item.companyName} following request refused")));
                  } else {
                    Scaffold.of(context).showSnackBar(
                        SnackBar(content: Text(response.apiError)));
                  }
                }
              },
              child: item);
        });
  }

  @override
  Widget build(BuildContext context) {
    var pendingListFuture = new FutureBuilder(
      future: apiManager().getRequests(state: "pending"),
      builder: (BuildContext context, AsyncSnapshot snapshot) {
        switch (snapshot.connectionState) {
          case ConnectionState.none:
          case ConnectionState.waiting:
            return new Center(
              child: CircularProgressIndicator(
                valueColor:
                    new AlwaysStoppedAnimation(colorStyles['primary_pink']),
              ),
            );
          default:
            if (snapshot.hasError)
              return new Text('Error: ${snapshot.error}');
            else
              return createListView(
                  context, snapshot, DismissDirection.horizontal);
        }
      },
    );

    var activeListFuture = new FutureBuilder(
      future: apiManager().getRequests(state: "authorized"),
      builder: (BuildContext context, AsyncSnapshot snapshot) {
        switch (snapshot.connectionState) {
          case ConnectionState.none:
          case ConnectionState.waiting:
            return new Center(
              child: CircularProgressIndicator(
                valueColor:
                    new AlwaysStoppedAnimation(colorStyles['primary_pink']),
              ),
            );
          default:
            if (snapshot.hasError)
              return new Text('Error: ${snapshot.error}');
            else
              return createListView(
                  context, snapshot, DismissDirection.startToEnd);
        }
      },
    );

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
            pendingListFuture,
            SizedBox(height: 32.0),
            new Text(
              'Active requests',
              style: textStyles['title_text'],
            ),
            SizedBox(
              height: 32.0,
            ),
            activeListFuture,
          ],
        ),
      ),
    ));
  }
}
