// To parse this JSON data, do
//
//     final apiError = apiErrorFromJson(jsonString);

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
  String apiResponse;

  ApiResponse({
    this.apiResponse,
  });

  factory ApiResponse.fromJson(Map<String, dynamic> json) => new ApiResponse(
    apiResponse: json["apiResponse"],
  );

  Map<String, dynamic> toJson() => {
    "apiResponse": apiResponse,
  };
}
