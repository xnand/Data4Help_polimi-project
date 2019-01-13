import 'package:test/test.dart';
import 'package:trackmemobile/models/request.dart';

main() {
  String id = '11';
  String state = "pending";
  Company company = new Company(id: 21, vat: 'vat_test', name: 'company_test');

  test('Request constructor works properly', () {
    Request request = new Request(
        id: int.tryParse(id),
        state: state,
      company: company
    );

    expect(request.id.toString(), id);
    expect(request.state, state);
    expect(request.company, company);
  });


}