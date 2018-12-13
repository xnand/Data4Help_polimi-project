import 'dart:async';
import 'dart:io';
import 'dart:convert' show json, utf8;

class Api {
  final httpClient = HttpClient();

  final url = 'http://localhost:3001/api';
  
  Future<bool> login (String username, String password) async {
    final uri = Uri.https(url, '/login');

  }
}
