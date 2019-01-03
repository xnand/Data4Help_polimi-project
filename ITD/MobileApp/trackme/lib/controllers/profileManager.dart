import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileManager {
  Future<String> getPassword() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('password') ?? null;
  }

  Future<String> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('email') ?? null;
  }

  Future<String> getSSN() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.get('SSN');
  }

  Future<void> setLoginCredentials(String email, String password) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('email', email);
    prefs.setString('password', password);
  }

  Future<void> setSSN(String SSN) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setString('SSN', SSN);

  }

  Future<void> clearShared() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.clear();
  }

}