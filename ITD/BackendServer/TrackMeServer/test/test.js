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
	birthDate: '12 12 2000',
	country: 'italy',
	region: 'lombardia',
	city: 'milano',
	zipcode: '20100',
	street: 'test user street',
	streetNr: '1',
	mail: 'testusermail@test.com',
	password: 'TestUserPassword*&@#(!&'
};

var testUser1 = {
    ssn: 'TestUserSSN12346',
    name: 'TestUserName1',
    surname: 'TestUserSurname1',
    sex: 'female',
    birthDate: '12 13 2005',
    country: 'italy',
    region: 'lombardia',
    city: 'milano',
    zipcode: '20100',
    street: 'test user street',
    streetNr: '1',
    mail: 'testusermail1@test.com',
    password: 'TestUserPassword1*&@#(!&'
};


var ssn={
	ssn:testUser.ssn
};

var testRegisterWearable={
    macAddr: 'aa:bb:cc:dd:ee:ff',
	name: 'testNameWearable'
};

var testRegisterWearable1={
    macAddr: 'ff:ee:dd:cc:bb:aa',
    name: 'testNameWearable1'
};

var testCompany={
	name: 'HealthyResearch',
	vat: 'testVat',
	businessSector: 'Health'
};

var testSpecificRequest={
    apiKey: '',
	ssn: testUser.ssn,
    idRequest: ''
};

var testPacket={
	ts: "09/01/2019 11:47:59",
    wearableMac: testRegisterWearable.macAddr,
    userSsn: testUser.ssn,
	geoX: '12.4922260',
	geoY: '41.8902300',
	heartBeatRate: '70',
	bloodPressSyst: '100',
	bloodPressDias: '80',
};

var testPacket1={
    ts: '09/01/2019 18:12:40',
    wearableMac: testRegisterWearable.macAddr,
    geoX: '12.4922260',
    geoY: '41.8902300',
    heartBeatRate: '70',
    bloodPressSyst: '100',
    bloodPressDias: '80'
};

var testFilter={
	ageStart:36,
	ageEnd1:12
}

var testGroupRequest={
	idRequest: ''
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

describe('Register wearable device', function() {
	it('resiters a wearable device', function (done) {
		chai.request(ApplicationServerMobileClient)
			.post(`/api/${testUser.ssn.toLowerCase()}/wearableDevice`)
			.auth(testUser.mail, testUser.password)
			.send(testRegisterWearable)
			.end(function(err, res){
				res.should.have.status(201);
				done();
        });
    });
	it('register an other wearable device',function(done){
        chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/wearableDevice`)
            .auth(testUser.mail, testUser.password)
            .send(testRegisterWearable1)
            .end(function(err, res){
                res.should.have.status(201);
                done();
            });
	});
	it('obtains information about one registered wearable device',function (done) {
		chai.request(ApplicationServerMobileClient)
			.get(`/api/${testUser.ssn.toLowerCase()}/wearableDevice?macAddr=${testRegisterWearable.macAddr}&name=${testRegisterWearable.name}`)
			.auth(testUser.mail,testUser.password)
			.end(function (err, res) {
				res.should.have.status(200);
				done();
            });
    });
	it('obtains information about all registered wearable device',function (done){
        chai.request(ApplicationServerMobileClient)
            .get(`/api/${testUser.ssn.toLowerCase()}/wearableDevice`)
            .auth(testUser.mail,testUser.password)
            .end(function (err, res) {
                res.should.have.status(200);
                done();
            });
    });
	it('deletes a wearable device', function(done){
		chai.request(ApplicationServerMobileClient)
			.post(`/api/${testUser.ssn.toLowerCase()}/wearableDevice/delete`)
			.auth(testUser.mail, testUser.password)
			.send({
				macAddr:testRegisterWearable1.macAddr
            })
			.end(function(err, res){
				res.should.have.status(201);
				done();
			})
	});
    it('deletes a wearable device that does not exist', function(done){
        chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/wearableDevice/delete`)
            .auth(testUser.mail, testUser.password)
            .send({
                macAddr:testRegisterWearable1.macAddr
            })
            .end(function(err, res){
                res.should.have.status(400);
                done();
            })
    });
});


describe('Request', function(){
	it('shows all request', function (done){
		chai.request(ApplicationServerMobileClient)
			.get(`/api/${testUser.ssn.toLowerCase()}/request`)
			.auth(testUser.mail, testUser.password)
			.end(function(err, res){
				res.should.have.status(200);
				done();
			});
	});
});

describe('Accept request', function(){
	it('accepts a request that doesn\'t exists', function(done){
		chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/acceptRequest`)
            .auth(testUser.mail, testUser.password)
			.send({
				id:testSpecificRequest.idRequest
            })
			.end(function(err, res){
                res.should.have.status(400);
                done();
			});
	});
});

describe('Company Registration', function(){
	it('a company registers at the service', function(done){
		chai.request(ApplicationServerData4Help)
			.post(`/api/register`)
			.send(testCompany)
			.end(function (err, res) {
                res.should.have.status(201);
                testSpecificRequest.apiKey=res.body.apiKey;
                done();
            });
	});
	it('does not allow duplicate vat', function (done) {
			chai.request(ApplicationServerData4Help)
				.post(`/api/register`)
				.send(testCompany)
				.end(function(err, res){
					res.should.have.status(400);
					done();
			});
        });
});

describe('Specific Request', function () {
	it('a company sends specific request to a user', function (done) {
		chai.request(ApplicationServerData4Help)
			.post(`/api/specificRequest?apiKey=${testSpecificRequest.apiKey}`)
			.send({
				targetSsn: testSpecificRequest.ssn
			})
			.end(function(err, res){
				res.should.have.status(201);
				testSpecificRequest.idRequest=res.body.specificRequestId.toString();
				done();
			});
    });

	it('a company gets informations about all the registered specific requests', function(done){
        chai.request(ApplicationServerData4Help)
            .get(`/api/specificRequest?apiKey=${testSpecificRequest.apiKey}`)
            .end(function(err, res){
                res.should.have.status(200);
                done();
            });
	});
});

describe('Request',function(){
	it('shows a specific request', function (done) {
		chai.request(ApplicationServerMobileClient)
			.get(`/api/${testUser.ssn.toLowerCase()}/request?id=${testSpecificRequest.idRequest}`)
			.auth(testUser.mail, testUser.password)
			.end(function(err, res){
				res.should.have.status(200);
				done();
			});
    });
});

describe('Accept request', function(){
    it('accepts a request ', function(done){
        chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/acceptRequest`)
            .auth(testUser.mail, testUser.password)
            .send({id:testSpecificRequest.idRequest})
            .end(function(err, res){
                res.should.have.status(200);
                done()
            });
    });
});

describe('Send a new infopacket', function () {
	it('registers a packet containing information about user’s body', function(done){
		chai.request(ApplicationServerMobileClient)
			.post(`/api/${testUser.ssn.toLowerCase()}/packet`)
			.auth(testUser.mail, testUser.password)
			.send(testPacket)
			.end(function (err, res) {
				res.should.have.status(201);
				done();
            });
	});
	it('does not allow packet with same timestamp', function(done){
        chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/packet`)
            .auth(testUser.mail, testUser.password)
            .send(testPacket)
            .end(function (err, res) {
                res.should.have.status(400);
                done();
            });
	});
});

describe('Get requested data',function () {
	it('get requested data of a previously request', function (done) {
		chai.request(ApplicationServerData4Help)
			.get(`/api/specificRequest/data?apiKey=${testSpecificRequest.apiKey}&id=${testSpecificRequest.idRequest}`)
			.end(function (err, res) {
				res.should.have.status(200);
				done();
            });
    });
});

describe('Register user1', function() {
    it('registers a user into the system', function (done) {
        chai.request(ApplicationServerMobileClient)
            .post('/api/register')
            .send(testUser1)
            .end(function (err, res) {
                res.should.have.status(201);
                done();
            });
    });
});

describe('Send a new infopacket', function () {
    it('registers a packet containing information about user’s body', function (done) {
        chai.request(ApplicationServerMobileClient)
            .post(`/api/${testUser.ssn.toLowerCase()}/packet`)
            .auth(testUser.mail, testUser.password)
            .send(testPacket1)
            .end(function (err, res) {
                res.should.have.status(201);
                done();
            });
    });
});

describe('Forward a group request', function(){
	it('forwards a request for anonymous data about a large group of customers', function () {
		chai.request(ApplicationServerData4Help)
			.post(`/api/groupRequest?apiKey=${testSpecificRequest.apiKey}`)
			.send({
				filter:testFilter
            })
			.end(function (err,res) {
				res.should.have.status(201)
				testGroupRequest.idRequest=res.body.groupRequestId
				done();
            });
    });
	it('get informations about all the registered group requests', function () {
		chai.request(ApplicationServerData4Help)
			.get(`/api/groupRequest?apiKey=${testSpecificRequest.apiKey}`)
			.end(function (err, res) {
				res.should.have.status(200)
            });
    });
});

describe('Get requested data od a group request', function(){
	it('get requested data of previously group request',function(){
		chai.request(ApplicationServerData4Help)
			.get(`/api/groupRequest?apiKey=${testSpecificRequest.apiKey}&id=${testGroupRequest.idRequest}`)
			.end(function (err, res) {
				res.should.have.status(200)
            });
	});
});
