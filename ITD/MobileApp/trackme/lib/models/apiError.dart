// To parse this JSON data, do
//
//     final apiError = apiErrorFromJson(jsonString);

import 'dart:convert';

ApiError apiErrorFromJson(String str) {
  final jsonData = json.decode(str);
  return ApiError.fromJson(jsonData);
}

String apiErrorToJson(ApiError data) {
  final dyn = data.toJson();
  return json.encode(dyn);
}

class ApiError {
  String apiError;

  ApiError({
    this.apiError,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) => new ApiError(
    apiError: json["apiError"],
  );

  Map<String, dynamic> toJson() => {
    "apiError": apiError,
  };
}
