import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:track_me/networkManager/uriFactory.dart';
import 'package:track_me/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:track_me/models/apiResponse.dart';
import 'package:track_me/controllers/profileManager.dart';

class apiManager {
  final url = 'http://10.0.2.2:3001/api/';  //application server url
  final String noError = 'noError';
  ///implement a Basic https login with email and password
  Future<ApiResponse> login(String email, String password) async {
    String basicAuth = 'Basic ' + base64Encode(utf8.encode('$email:$password'));
    final response = await http.get('$url/login',
    headers: {
      HttpHeaders.authorizationHeader : basicAuth
    },);
    if(response.statusCode == 200) {
      ProfileManager().setSSN(userFromJson(response.body).ssn);
      return new ApiResponse(apiError: noError);

    }
    else return apiResponseFromJson(response.body);

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
    print(response?.body);
    if(response.statusCode == 201) return new ApiResponse(apiError: noError);
    else return apiResponseFromJson(response.body);
  }



}
