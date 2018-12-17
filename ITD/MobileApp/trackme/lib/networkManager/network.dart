import 'dart:async';
import 'dart:io';
import 'dart:convert';
import 'package:track_me/networkManager/uriFactory.dart';
import 'package:track_me/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:track_me/controllers/profileManager.dart';
import 'package:track_me/models/apiError.dart';
class apiManager {

  final httpClient = HttpClient();
  final uriFactory = UriFactory('http', '10.0.2.2', 3001);


  //called on the login page to log the user inside the app
  Future<bool> login(String email, String password) async {
    final loginUri = uriFactory.createUri('/api/login');
    String str = 'Basic ' + base64Encode(utf8.encode('$email:$password'));

    var request = await httpClient.getUrl(loginUri);
    request.headers.add('authorization', str);
    var response = await request.close();

    await for (var contents in response.transform(Utf8Decoder())) {
      var decoded = jsonDecode(contents);
      User.fromJson(decoded);
      //ProfileManager().saveLocalUser(email, password, SSN);
    }
  }
  
  Future<ApiError> registerUser(User user) async {
    final response = await http.post('http://10.0.2.2:3001/api/register',
    headers: {
      HttpHeaders.contentTypeHeader: 'application/json'
    },
      body: userToJson(user)
    );
    var body = await response.body.toString();
    return apiErrorFromJson(response.body);
  }





}
