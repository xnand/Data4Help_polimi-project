// To parse this JSON data, do
//
//     final apiResponse = apiResponseFromJson(jsonString);

import 'dart:convert';

ApiResponse apiResponseFromJson(String str) {
  final jsonData = json.decode(str);
  return ApiResponse.fromJson(jsonData);
}

String apiResponseToJson(ApiResponse data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class ApiResponse {
  String apiError;

  ApiResponse({
    this.apiError,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) => new ApiResponse(
    apiError: json["apiError"],
  );

  Map<String, dynamic> toJson() => {
    "apiError": apiError,
  };
}
