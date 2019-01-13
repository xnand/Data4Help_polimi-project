import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:trackmemobile/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/controllers/profileManager.dart';
import 'package:trackmemobile/models/request.dart';
import 'package:trackmemobile/models/device.dart';

abstract class MobileAppServerInterface {

  ///{POST} implement a Basic http login with [email] and [password]
  Future<ApiResponse> login(String email, String password);

  ///{POST} register a [User] to TrackMe, see Api Documentation for all the required forms
  ///fields.
  ///returns an [ApiResponse] with the outcome of the HTTP request

  Future<ApiResponse> registerUser(User user);

  /// {GET} returns a [Future<RequestList>] for the current user with the [state] that can [pending] or [active],
  /// alternatively if an error occurred, returns an [ApiResponse] with the specific error.
  Future<dynamic> getRequests({String state});

  /// {GET} return a [Future<WearableList>] for the current user,
  /// alternatively if an error occurred, returns an [ApiResponse] with the specific error.
  Future<dynamic> getWearableDevice({String macAddr});

  /// {POST} accept a [Request] specified by [requestId] for the current user.
  /// returns an [ApiResponse] with the outcome of the HTTP request
  Future<ApiResponse> acceptRequest(String requestId);

  /// {POST} reject a [Request] specified by [requestId] for the current user,
  /// returns an [ApiResponse] with the outcome of the HTTP request
  Future<ApiResponse> rejectRequest(String requestId);

  /// {POST} register a [Device] for the current user with [macAddr] as the MAC address of the
  /// device and [name] ast the device identifier.
  /// returns an [ApiResponse] with the outcome of the HTTP request
  Future<ApiResponse> registerWearable(String macAddr, String name);

  /// {POST} delete a [Device] for the current user identified by the [macAddr] of the device.
  /// returns an [ApiResponse] with the outcome of the HTTP request
  Future<ApiResponse> deleteWearable(String macAddr);
}



class apiManager extends MobileAppServerInterface {
  final _url = 'http://192.168.1.86:3001/api/'; //application server url
  final String _noError = 'noError';

  @override
  Future<ApiResponse> login(String email, String password) async {
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    final response = await http.get(
      '$_url/login',
      headers: {HttpHeaders.authorizationHeader: basicAuth},
    );
    if (response.statusCode == 200) {
      await ProfileManager().clearShared();
      ProfileManager().setSSN(userFromJson(response.body).ssn);
      ProfileManager().setLoginCredentials(email, password);
      return new ApiResponse(apiError: _noError);
    } else
      return apiResponseFromJson(response.body);


  }

  @override
  Future<ApiResponse> registerUser(User user) async {
    final response = await http.post('$_url/register',
        headers: {HttpHeaders.contentTypeHeader: 'application/json'},
        body: userToJson(user));

    if (response.statusCode == 201)
      return new ApiResponse(apiError: _noError);
    else
      return apiResponseFromJson(response.body);
  }

  @override
  Future<dynamic> getRequests({String state}) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();
    String toAppend = "";

    switch(state) {
      case "pending" : {
        toAppend = "?state=pending";
        break;
      }
      case "authorized" : {
        toAppend = "?state=authorized";
        break;
      }

    }

    final response = await http.get(
      '$_url/$SSN/request$toAppend',
      headers: {HttpHeaders.authorizationHeader: basicAuth},
    );

    if (response.statusCode == 200) {
      List<Request> requestList = (json.decode(response.body) as List)
          .map((json) => new Request.fromJson(json))
          .toList();

      return requestList;

    }

    ApiResponse error = apiResponseFromJson(response.body);
    return error;
  }

  @override
  Future<dynamic> getWearableDevice({String macAddr}) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();
    String toAppend = "";

    if(macAddr != null)toAppend='?macAddr=$macAddr';


    final response = await http.get(
      '$_url/$SSN/wearableDevice$toAppend',
      headers: {HttpHeaders.authorizationHeader: basicAuth},
    );

    if(response.statusCode == 200) {
      List<Wearable> wearableList = (jsonDecode(response.body) as List)
          .map((json) => new Wearable.fromJson(json))
          .toList();

      return wearableList;
    }
    ApiResponse error = apiResponseFromJson(response.body);

    return null;

  }


  @override
  Future<ApiResponse> acceptRequest(String requestId) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();

    final response = await http.post(
      "$_url/$SSN/acceptRequest",
      headers: {HttpHeaders.authorizationHeader: basicAuth},
      body: {"id" : requestId},
    );
    if(response.statusCode == 200)return new ApiResponse(apiError: _noError);
    else return apiResponseFromJson(response.body);
  }

  @override
  Future<ApiResponse> rejectRequest(String requestId) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();

    final response = await http.post(
      "$_url/$SSN/rejectRequest",
      headers: {HttpHeaders.authorizationHeader: basicAuth},
      body: {"id" : requestId
      },
    );
    if(response.statusCode == 200)return new ApiResponse(apiError: _noError);
    else return apiResponseFromJson(response.body);
  }

  @override
  Future<ApiResponse> registerWearable(String macAddr, String name) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();

    final response = await http.post(
      "$_url/$SSN/wearableDevice",
      headers: {HttpHeaders.authorizationHeader: basicAuth},
      body: {"macAddr" : macAddr,
             "name" : name
      },
    );
    if(response.statusCode == 200)return new ApiResponse(apiError: _noError);
    else return apiResponseFromJson(response.body);
  }

  @override
  Future<ApiResponse> deleteWearable(String macAddr) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await _craftAuthString();

    final response = await http.post(
      "$_url/$SSN/wearableDevice/delete",
      headers: {HttpHeaders.authorizationHeader: basicAuth},
      body: {"macAddr" : macAddr
      },
    );
    print(response.statusCode);
    if(response.statusCode == 201)return new ApiResponse(apiError: _noError);
    else return apiResponseFromJson(response.body);
  }



  ///return a [Future<String>] with a crafted authentication string,
  ///the [basicAuth] string generated is ready to be appended to the
  ///Authentication header
  Future<String> _craftAuthString() async {
    String email = await ProfileManager().getEmail();
    String password = await ProfileManager().getPassword();

    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    return basicAuth;
  }

}
///a class used to test the GUI behavior
class MockUpApiManager extends MobileAppServerInterface {
  bool didAttemtedLogin = false;
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
  Future<ApiResponse> login(String email, String password) async {
    didAttemtedLogin = true;
    String email_test = "email_test";
    String password_test = "test_password";
    if(email_test == email && password_test == password)
    return new ApiResponse(apiError: 'noError');
    else return new ApiResponse(apiError: 'credentials are wrong');

  }

  @override
  Future<ApiResponse> registerUser(User user) async {
    // TODO: implement registerUser
    return null;
  }

  @override
  Future<ApiResponse> registerWearable(String macAddr, String name) async {
    // TODO: implement registerWearable
    return null;
  }

  @override
  Future<ApiResponse> rejectRequest(String requestId) async {
    // TODO: implement rejectRequest
    return null;
  }

}