import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:trackmemobile/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:trackmemobile/models/apiResponse.dart';
import 'package:trackmemobile/controllers/profileManager.dart';
import 'package:trackmemobile/models/request.dart';
import 'package:trackmemobile/models/device.dart';

class apiManager {
  final _url = 'http://192.168.1.86:3001/api/'; //application server url
  final String _noError = 'noError';

  ///implement a Basic http login with email and password
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

  ///register a user to TrackMe {POST}
  Future<ApiResponse> registerUser(User user) async {
    final response = await http.post('$_url/register',
        headers: {HttpHeaders.contentTypeHeader: 'application/json'},
        body: userToJson(user));

    if (response.statusCode == 201)
      return new ApiResponse(apiError: _noError);
    else
      return apiResponseFromJson(response.body);
  }

  //return sharingRequest for the current user {GET}
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

  //return wearable device for the user  {GET}
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
    return error;

  }


  //accept a request for the current user {POST}
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

  //reject a request for the current user {POST}
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

  //register a wearable for the current user {POST}
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

  //delete a wearable for the current user {POST}
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



  //return a future list with a crafted authentication string
  Future<String> _craftAuthString() async {
    String email = await ProfileManager().getEmail();
    String password = await ProfileManager().getPassword();

    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    return basicAuth;
  }


  //-----------------------------------------------------INFOPACKET HANDLING--------------------------------



}
