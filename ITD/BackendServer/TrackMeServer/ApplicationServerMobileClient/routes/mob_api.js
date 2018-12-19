var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../common/config.json');
var common = require('../../common/common');


router.post('/register', function(req, res) {
    var params = {};
    Object.keys(req.body).forEach(function(k) {
        if (k !== 'password') {
            params[k] = req.body[k].toLowerCase();
        }
        else {
            params[k] = req.body[k];
        }
    });
    common.validateParams(params, [
        'ssn',
        'name',
        'surname',
        'sex',
        'birthDate',
        'country',
        'region',
        'city',
        'zipcode',
        'street',
        'streetNr',
        'mail',
        'password'
    ])
        .then(function() {
            // check existing mail
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/`,
                method: 'GET',
                qs: {
                    ssn: params.ssn
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0];
            if (reqdata) {
                return Promise.reject({apiError: `user ${params.ssn} already registered`});
            }
            // check existing ssn
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/credentials`,
                method: 'GET',
                qs: {
                    mail: params.mail
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0];
            if (reqdata) {
                return Promise.reject({apiError: `mail ${params.mail} already registered`});
            }
            // record data
            params.sex = params.sex.replace(/^m.*/g, 'male').replace(/^f.*/g, 'female');
            params.password = common.genHash(params.password);
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/register`,
                method: 'POST',
                json: true,
                body: params
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            res.status(201).end(); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.get('/login', function(req, res) {
    validateCredentials(req, res, function() {
        var ssn = req.params.ssn;
        request({
            url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/`,
            method: 'GET',
            qs: {
                ssn: ssn
            }
        })
            .then(function(reqres) {
                row = JSON.parse(reqres.body);
                res.status(200).send(row[0]);
            })
            .catch(function(err) {
                common.catchApi(err, res);
            })
    })
});

router.param('ssn', validateCredentials);

router.post('/:ssn/registerWearable', function(req, res) {
    var params = {};
    params.ssn = req.params.ssn;
    Object.keys(req.body).forEach(function(k) {
        params[k] = req.body[k].toLowerCase();
    });
    common.validateParams(params, [
        'macAddr'
    ])
        .then(function() {
            params.macAddr = params.macAddr.replace(/[ -]/g, '');
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/wearableDevice`,
                method: 'GET',
                qs: {
                    macAddr: params.macAddr
                }
            });
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject({apiError: 'invalid macAddr'});
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (reqdata.userSsn) {
                return Promise.reject({apiError: 'invalid macAddr'});
            }
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/registerWearable`,
                method: 'POST',
                json: true,
                body: params
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            res.status(201).end(); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.get('/:ssn/request', function(req, res) {
	var ssn = req.params.ssn.toLowerCase();
	var allowed = ['id', 'state', 'companyId'];
	var requests;
	common.validateParams(req.query, allowed, allowed)
		.then(function() {
			var where = {
				targetSsn: ssn
			};
			for (var q in req.query) {
				where[q] = req.query[q];
			}
			// get the requests
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/specificRequest`,
				method: 'GET',
				qs: where
			})
		})
		.then(function(reqres) {
			if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
				return Promise.reject();
			}
			var reqdata = JSON.parse(reqres.body);
			// for every request, put in the company data
			var promises = [];
			requests = reqdata;
			for (var i = 0; i < reqdata.length; i++) {
				delete requests[i].companyId;
				delete requests[i].targetSsn;
				promises[i] = request({
					url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company`,
					method: 'GET',
					qs: {
						id: reqdata[i].companyId
					}
				});
			}
			return Promise.all(promises);
		})
		.then(function(rows) {
			// order is preserved
			for (var i = 0; i < rows.length; i++) {
				var companyData = JSON.parse(rows[i].body)[0];
				delete companyData.apiKey;
				requests[i].company = companyData;
			}
			res.status(200).send(requests); // success
		})
		.catch(function(err) {
			common.catchApi(err, res);
		})
});

router.post('/:ssn/acceptRequest', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    var params = {};
    Object.keys(req.body).forEach(function(k) {
        params[k] = req.body[k].toLowerCase();
    });
    common.validateParams(params, [
        'id',
    ])
        .then(function() {
            // check that the request has this user as target
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/specificRequest`,
                method: 'GET',
                qs: {
                    targetSsn: ssn,
                    id: params.id
                }
            });
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject({apiError: 'you can\'t accept this request'});
            }
            var reqdata = JSON.parse(reqres.body) || '';
            if (!reqdata[0].id) {
                return Promise.reject({apiError: 'you can\'t accept this request'});
            }
            else if (reqdata[0].state === 'authorized') {
                return Promise.reject({apiError: 'you already accepted this request'});
            }
            // change the request status to accepted
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/acceptRequest`,
                method: 'POST',
                json: true,
                body: {
                    ssn: ssn,
                    id: params.id
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            res.status(200).end();
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.post('/:ssn/packet', function(req, res) {
	var ssn = req.params.ssn.toLowerCase();
    var params = {};
    Object.keys(req.body).forEach(function(k) {
        params[k] = req.body[k].toLowerCase();
    });
    params.userSsn = ssn;
    common.validateParams(params, [
        'ts',
        'wearableMac',
        'userSsn',
        'geoX',
        'geoY',
        'heartBeatRate',
        'bloodPressSyst',
        'bloodPressDias'
    ], [
        'heartBeatRate',
        'bloodPressSyst',
        'bloodPressDias'
    ])
        .then(function() {
            // check that the incoming packet is legit
            params.wearableMac = params.wearableMac.replace(/[ -]/g, '');
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/wearableDevice`,
                method: 'GET',
                qs: {
                    macAddr: params.wearableMac
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.userSsn || reqdata.userSsn !== params.userSsn) {
                return Promise.reject({apiError: 'invalid wearableMac'});
            }
            // todo check timestamp value!!!!!
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/infoPacket`,
                method: 'POST',
                json: true,
                body: params
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            res.status(201).end(); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

function validateCredentials(req, res, next) {
    var ssn = req.params.ssn;
    try {
		var header = (req.headers['authorization'] || '').split(/Basic /)[1];
		// email, password, sessionToken
		var auth = new Buffer.from(header.split(/\s+/).pop() || '', 'base64').toString().split(/:/);
	}
	catch {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.status(401).end();
	}
    new Promise(function(resolve, reject) {
        if (!ssn) { // case /login
            request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/credentials`,
                method: 'GET',
                qs: {
                    mail: auth[0]
                }
            })
                .then(function(reqres) {
                    if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                        return Promise.reject();
                    }
                    var reqdata = JSON.parse(reqres.body)[0] || '';
                    if (!reqdata.ssn) {
                        return Promise.reject({apiError: `email ${auth[0]} is not registered`});
                    }
                    ssn = reqdata.ssn; //todo checks ??
                    resolve();
                })
                .catch(function(err) {
                    reject(err);
                })
        }
        else {
            ssn = ssn.toLowerCase();
            resolve();
        }
    })
        .then(function() {
            return common.validateParams({ssn: ssn}, ['ssn']);
        })
        .then(function() {
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/credentials`,
                method: 'GET',
                qs: {
                    ssn: ssn
                }
            })
        })
        .then(function(reqres) {
            if (reqres.statusCode !== 200) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.ssn || reqdata.ssn !== ssn) {
                return Promise.reject({apiError: 'invalid ssn'});
            }
            if (auth[0] === reqdata.mail && common.genHash(auth[1]) === reqdata.password) {
                req.params.ssn = ssn; // DO NOT DELETE, this passes the ssn to next(). first line is not good for all cases
                next(); // success
            }
            else if (auth[0] === reqdata.mail && common.genHash(auth[1]) !== reqdata.password) {
                return Promise.reject({apiError: 'wrong password'});
            }
            else {
				res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                res.status(401).end();
            }
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
}


module.exports = router;