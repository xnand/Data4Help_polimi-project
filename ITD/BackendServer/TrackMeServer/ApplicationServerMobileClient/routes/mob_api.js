var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../common/config.json');
var common = require('../../common/common');


// register a user
router.post('/register', function(req, res) {
	// parse parameters
    var params = {};
    Object.keys(req.body).forEach(function(k) {
        if (k !== 'password') {
            params[k] = req.body[k].toLowerCase();
        }
        else {
            params[k] = req.body[k];
        }
    });
    // validate parameters
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
            // check existing ssn
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
            // check existing mail
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

// test the credentials and send back user info
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

// this calls validateCredentials before handling any endpoint with the SSN in its URI
router.param('ssn', validateCredentials);

// register a wearable device
router.post('/:ssn/registerWearable', function(req, res) {
	// parse parameters
    var params = {};
    params.ssn = req.params.ssn;
    Object.keys(req.body).forEach(function(k) {
        params[k] = req.body[k].toLowerCase();
    });
    // validate parameters
    common.validateParams(params, [
        'macAddr'
    ])
        .then(function() {
            params.macAddr = params.macAddr.replace(/[ -]/g, '');
            // check that the wearable with this mac address is not already registered
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
            	// there is one user with this wearable registered already
                return Promise.reject({apiError: 'wearable already registered'});
            }
            // record the wearable
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

// get all request, optionally filter by query
router.get('/:ssn/request', function(req, res) {
	// parse & validate parameters
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
			// for every request, append the company data
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

// accept a specific request
router.post('/:ssn/acceptRequest', function(req, res) {
	// parse & validate parameters
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
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body) || '';
            if (!reqdata[0].id) {
            	// no such request
                return Promise.reject({apiError: 'you can\'t accept this request'});
            }
            else if (reqdata[0].state === 'authorized') {
                return Promise.reject({apiError: 'you already accepted this request'});
            }
            else if (reqdata[0].state === 'rejected') {
				return Promise.reject({apiError: 'you can\'t accept a request you have previously refused'});
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
            res.status(200).end(); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

// reject a specific request
router.post('/:ssn/rejectRequest', function(req, res) {
	// parse & validate parameters
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
				return Promise.reject();
			}
			var reqdata = JSON.parse(reqres.body) || '';
			if (!reqdata[0].id) {
				// no such request
				return Promise.reject({apiError: 'you can\'t reject this request'});
			}
			else if (reqdata[0].state === 'rejected') {
				return Promise.reject({apiError: 'you already rejected this request'});
			}
			// change the request status to rejected
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/rejectRequest`,
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
			res.status(200).end(); // success
		})
		.catch(function(err) {
			common.catchApi(err, res);
		})
});

// register a infoPacket
router.post('/:ssn/packet', function(req, res) {
	// parse & validate parameters
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
            // check that the incoming packet comes from a wearable owned by this user
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
            	// no such wearable or wearable has a different user associated
                return Promise.reject({apiError: 'invalid wearableMac'});
            }
            // todo check timestamp value
			// as soon as we verified the packet is legit, check to see if an ambulance needs to be dispatched
			if (reqdata.emergency.toLowerCase() === 'true') {
				dispatchAmbulance(reqdata);
			}
			// record the packet
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
            // check if there is a subscription we need to send this data to
            var promises = [];
            ['specificRequest', 'groupRequest'].forEach(function(t) {
                promises.push(request({
                    url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/${t}`,
                    method: 'GET',
                    qs: {
                        targetSsn: ssn,
                        state: 'authorized',
                        subscription: true
                    }
                }))
            });
            return Promise.all(promises);
        })
        .then(function(queryRes) {
            // send data to subscribed companies
            delete params.userSsn;
            delete params.wearableMac; // todo yes? no? maybe?
            var forwards = [];
            for (var i = 0; i < 2; i++) {
                if (queryRes[i].body && queryRes[i].body.length > 0) {
                    var reqdata = JSON.parse(queryRes[i].body);
                    for (var j = 0; j < reqdata.length; j++) {
                        if (forwards.includes(reqdata[j].subscriptionForwardingLink)) {
                            continue; // send the packet only once per subscription link
                        }
                        forwards.push(reqdata[j].subscriptionForwardingLink);
                    }
                }
            }
            var link;
            for (var i = 0; i < forwards.length; i++) {
                link = forwards[i];
                request({
                    url: link,
                    method: 'POST',
                    timeout: 5,
                    json: true,
                    body: params
                })
                    .catch(function() {
                    	// forwardingLink not reachable
                        console.log(link);
                        // todo disable subscription?
						// todo
                    })
            }
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

// grab email & password from the 'authorization' header and check them against the registered users
// follows http basic auth
function validateCredentials(req, res, next) {
    var ssn = req.params.ssn;
    try {
		var header = (req.headers['authorization'] || '').split(/Basic /)[1];
		// auth = [email, password]
		var auth = new Buffer.from(header.split(/\s+/).pop() || '', 'base64').toString().split(/:/);
	}
	catch {
    	// no credentials supplied
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.status(401).end();
	}
	// obtain the ssn
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
        else { // all other cases, take it from the url
            ssn = ssn.toLowerCase();
            resolve();
        }
    })
        .then(function() {
            return common.validateParams({ssn: ssn}, ['ssn']);
        })
        .then(function() {
        	// grab mail & hash(password) from db
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
            	// ssn not registered
                return Promise.reject({apiError: 'invalid ssn'});
            }
            if (auth[0] === reqdata.mail && common.genHash(auth[1]) === reqdata.password) {
                req.params.ssn = ssn; // reminder to me: DO NOT DELETE (again), this passes the ssn to next(). first line is not good for all cases
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

function dispatchAmbulance(infoPacket) {
	// todo?
}


module.exports = router;