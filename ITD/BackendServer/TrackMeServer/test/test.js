var config = require('../common/config');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
// var expect = chai.expect;
var ApplicationServerMobileClient = `http://${config.address.applicationServerMobileClient}:${config.port.applicationServerMobileClient}`;
var ApplicationServerData4Help = `http://${config.address.applicationServerData4Help}:${config.port.applicationServerData4Help}`;
var DatabaseServer = `http://${config.address.databaseServer}:${config.port.databaseServer}`;

chai.use(chaiHttp);

var testUser = {
	ssn: 'TestUserSSN12345',
	name: 'TestUserName',
	surname: 'TestUserSurname',
	sex: 'male',
	birthDate: '24 12 2000',
	country: 'italy',
	region: 'lombardia',
	city: 'milano',
	zipcode: '20100',
	street: 'test user street',
	streetNr: '1',
	mail: 'testusermail@test.com',
	password: 'TestUserPassword*&@#(!&'
};

describe('Register user', function() {
	it('registers a user into the system', function(done) {
		chai.request(ApplicationServerMobileClient)
			.post('/api/register')
			.send(testUser)
			.end(function(err, res) {
				res.should.have.status(201);
				done();
			})
	});
	it('does not allow duplicate emails', function(done) {
		var sameMail = JSON.parse(JSON.stringify(testUser));
		sameMail.ssn = 'differentSSN1234';
		chai.request(ApplicationServerMobileClient)
			.post('/api/register')
			.send(testUser)
			.end(function(err, res) {
				res.should.have.status(400);
				done();
			})
	});
	it('does not allow duplicate SSN', function(done) {
		var sameSsn = JSON.parse(JSON.stringify(testUser));
		sameSsn.mail = 'differentMail@test.mail';
		chai.request(ApplicationServerMobileClient)
			.post('/api/register')
			.send(testUser)
			.end(function(err, res) {
				res.should.have.status(400);
				done();
			})
	})
});

describe('Login user', function() {
	it('tests user credentials and gives back user information', function(done) {
		chai.request(ApplicationServerMobileClient)
			.get('/api/login')
			.auth(testUser.mail, testUser.password)
			.end(function(err, res) {
				res.should.have.status(200);
				res.should.be.json;
				[
					'ssn',
					'name',
					'surname',
					'sex',
					'country',
					'region',
					'city',
					'zipcode',
					'street',
					'streetNr'
				].forEach(function(k) {
					res.body[k].should.equal(testUser[k].toLowerCase());
				});
				new Date(res.body.birthDate).getTime().should.equal(new Date(testUser.birthDate).getTime());
				// mail and password are tested with authentication
				done();
			})
	})
});

describe('Register wearable', function() {
	it('registers a wearable device', function(done) {
		chai.request(ApplicationServerMobileClient)
			.post(`/api/${testUser.ssn.toLowerCase()}/wearableDevice`)
			.auth(testUser.mail, testUser.password)
			.send({
				macAddr: 'aa:bb:cc:dd:ee:ff',
				name: 'test wearable'
			})
			.end(function(err, res) {
				res.should.have.status(201);
				done();
			})
	})
});
