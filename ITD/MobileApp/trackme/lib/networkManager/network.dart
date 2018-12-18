import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:track_me/networkManager/uriFactory.dart';
import 'package:track_me/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:track_me/models/apiResponse.dart';

class apiManager {
  final url = 'http://10.0.2.2:3001/api/';  //application server url

  ///implement a Basic https login with email and password
  Future<ApiResponse> login(String email, String password) async {
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    final response = await http.get('$url/login',
    headers: {
      HttpHeaders.authorizationHeader : basicAuth
    },);
    return apiResponseFromJson(response.body);
  }

  ///register a user to TrackMe
  Future<ApiResponse> registerUser(User user) async {
    final response = await http.post('$url/register',
    headers: {
      HttpHeaders.contentTypeHeader: 'application/json'
    },
      body: userToJson(user)
    );
    return apiResponseFromJson(response.body);
  }



}
