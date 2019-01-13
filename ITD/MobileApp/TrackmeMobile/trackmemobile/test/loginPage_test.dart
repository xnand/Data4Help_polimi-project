import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/ProfileManager/network.dart';
import 'package:trackmemobile/screens/loginpage.dart';
import 'package:flutter/material.dart';
import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/models/user.dart';

///a class used to test the GUI behavior
class MockupApiManager implements  MobileAppServerInterface {

  bool didAttemptedLogin = false;
  @override
  Future<ApiResponse> login(String email, String password) {

  }

  @override
  Future<ApiResponse> acceptRequest(String requestId) {
    // TODO: implement acceptRequest
    return null;
  }

  @override
  Future<ApiResponse> deleteWearable(String macAddr) {
    // TODO: implement deleteWearable
    return null;
  }

  @override
  Future getRequests({String state}) {
    // TODO: implement getRequests
    return null;
  }

  @override
  Future getWearableDevice({String macAddr}) {
    // TODO: implement getWearableDevice
    return null;
  }

  @override
  Future<ApiResponse> registerUser(User user) {
    // TODO: implement registerUser
    return null;
  }

  @override
  Future<ApiResponse> registerWearable(String macAddr, String name) {
    // TODO: implement registerWearable
    return null;
  }

  @override
  Future<ApiResponse> rejectRequest(String requestId) {
    // TODO: implement rejectRequest
    return null;
  }
}

void main() {

  Widget makeTestableWidget({Widget child}) {
    return MaterialApp(
      home: child,
    );
  }
  MockUpApiManager mockUpApiManager =  MockUpApiManager();

  testWidgets('email or password is empty, does not attempt login on LOGIN pressed', (WidgetTester tester) async {
    LoginPage page = new LoginPage();

    await tester.pumpWidget(makeTestableWidget(child: page));
    await tester.tap(find.byKey(Key('loginButton')));

    expect(mockUpApiManager.didAttemtedLogin, false);

  });

}