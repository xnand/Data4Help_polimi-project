import 'package:flutter/material.dart';
import 'colors.dart';


//this map implement text styles used inside the application

Map<String, TextStyle> textStyles = {
  'title_text': new TextStyle(
    fontSize: 28.0,
    fontFamily: 'Roboto',
    fontWeight: FontWeight.bold,
    color: colorStyles['text_color'],
  ),

  'normal_text': new TextStyle(
    fontSize: 24.0,
    fontFamily: 'Roboto',
    fontWeight: FontWeight.normal,
    color: colorStyles['text_color'],
  ),

};