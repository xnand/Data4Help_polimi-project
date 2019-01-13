import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/models/apiResponse.dart';

void main() {
  String apiError = "testError";


  test('apiResponse constructor work properly',() {
    ApiResponse apiResponse = new ApiResponse(apiError: apiError);

    expect(apiResponse.apiError, apiError);
  });

  test('apiResponse.toJson work properly',() {
    ApiResponse apiResponse = new ApiResponse(apiError: apiError);
    apiResponseToJson(apiResponse);
    Map<String, dynamic> jsonApiResponse =
    {
      'apiError' : apiError
    };

    expect(apiResponse.toJson(), jsonApiResponse);
  });

  test('ApiResponse.fromJson work properly', () {
    Map<String, dynamic> jsonApiResponse =
    {
      'apiError' : apiError
    };

    ApiResponse apiResponse = ApiResponse.fromJson(jsonApiResponse);

    expect(apiResponse.apiError, apiError);
  });
}