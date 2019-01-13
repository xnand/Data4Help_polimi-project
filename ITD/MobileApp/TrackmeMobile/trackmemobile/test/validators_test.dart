import 'package:flutter_test/flutter_test.dart';
import 'package:trackmemobile/utils/validators.dart';

void main() {
  test('title', () {
    //setup

    //run

    //verify
  });

  test('empty email returns error string', () {
   var result = EmailFIeldValidator.validate('');

   expect(result, 'Email can\'t be empty');
  });

  test('non-empty email returns null', () {
    var result = EmailFIeldValidator.validate('email');

    expect(result, null);
  });

  test('empty password returns error string', (){
    var result = PasswordFieldValidator.validate('');
    expect(result, 'Password can\'t be empty');
  });

  test('non-empty password return null', () {
    var result = EmailFIeldValidator.validate('password');

    expect(result, null);
  });

  test('empty name returns error string', (){
    var result = NameFieldValidator.validate('');
    expect(result, 'Name can\'t be empty');
  });

  test('non-empty name return null', () {
    var result = NameFieldValidator.validate('name');

    expect(result, null);
  });

  test('empty Surname returns error string', (){
    var result = SurnameFieldValidator.validate('');
    expect(result, 'Surname can\'t be empty');
  });

  test('non-empty Surname return null', () {
    var result = SurnameFieldValidator.validate('surname');

    expect(result, null);
  });

  test('empty street returns error string', (){
    var result = StreetFieldValidator.validate('');
    expect(result, 'Street can\'t be empty');
  });

  test('non-empty street return null', () {
    var result = EmailFIeldValidator.validate('street');

    expect(result, null);
  });

  test('empty region returns error string', (){
    var result = RegionFieldValidator.validate('');
    expect(result, 'Region can\'t be empty');
  });

  test('non-empty region return null', () {
    var result = RegionFieldValidator.validate('region');

    expect(result, null);
  });



}
