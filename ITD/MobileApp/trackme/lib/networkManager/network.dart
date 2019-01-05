import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:track_me/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:track_me/models/apiResponse.dart';
import 'package:track_me/controllers/profileManager.dart';
import 'package:track_me/models/request.dart';

class apiManager {
  final url = 'http://192.168.1.141:3001/api/'; //application server url
  final String noError = 'noError';

  ///implement a Basic http login with email and password
  Future<ApiResponse> login(String email, String password) async {
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    final response = await http.get(
      '$url/login',
      headers: {HttpHeaders.authorizationHeader: basicAuth},
    );
    if (response.statusCode == 200) {
      ProfileManager().setSSN(userFromJson(response.body).ssn);
      return new ApiResponse(apiError: noError);
    } else
      return apiResponseFromJson(response.body);

    
  }

  ///register a user to TrackMe
  Future<ApiResponse> registerUser(User user) async {
    final response = await http.post('$url/register',
        headers: {HttpHeaders.contentTypeHeader: 'application/json'},
        body: userToJson(user));

    if (response.statusCode == 201)
      return new ApiResponse(apiError: noError);
    else
      return apiResponseFromJson(response.body);
  }
  //return sharingRequest for the current user
  Future<Object> getRequests({String state}) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await craftAuthString();
    String toAppend;
    if(state == "pending" || state == "accepted")toAppend = "?state=$state";
    else toAppend= "";
    
    final response = await http.get(
      '$url/$SSN/request$toAppend',
      headers: {HttpHeaders.authorizationHeader: basicAuth},
    );
    if (response.statusCode == 200) {
      List<Request> requestList = (json.decode(response.body) as List)
          .map((e) => new Request.fromJson(e))
          .toList();
      return requestList;
    }
  }

  

  Future<ApiResponse> acceptRequest(String requestId) async {
    String SSN = await ProfileManager().getSSN();
    String basicAuth = await craftAuthString();

    final response = await http.post(
      "$url/$SSN/acceptRequest",
      headers: {HttpHeaders.authorizationHeader: basicAuth},
      body: {"id" : requestId},
    );
    if(response.statusCode == 200)return new ApiResponse(apiError: noError);
    else return apiResponseFromJson(response.body);
  }

  //return a future list with a crafted authentication string
  Future<String> craftAuthString() async {
    String email = await ProfileManager().getEmail();
    String password = await ProfileManager().getPassword();

    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    return basicAuth;
  }
}
