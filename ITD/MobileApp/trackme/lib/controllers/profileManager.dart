import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
class ProfileManager {
  Future<String> retrieveLocalUser() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.get('email') ?? null;
  }

  Future<void> saveLocalUser(String email, String password, String SSN) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setStringList('credentials', [email,password, SSN]);
    var credentials = await prefs.getStringList('credentials');
    print(credentials.elementAt(2));
  }




}