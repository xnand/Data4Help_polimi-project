var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../common/config.json');
var common = require('../../common/common');


router.post('/register', function(req, res) {
    var params = {};
    Object.keys(req.body).forEach(function (k) {
        params[k] = req.body[k].toLowerCase();
    });
    common.validateParams(params, [
        'vat',
        'name'
    ])
        .then(function() {
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company`,
                method: 'GET',
                qs: {
                    vat: params.vat
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (reqdata.id) {
                return Promise.reject({apiError: `company with vat ${params.vat} already registered`});
            }
            params.apiKey = generateAPIkey();
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/register`,
                method: 'POST',
                json: true,
                body: params
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200) {
                return Promise.reject();
            }
            res.status(201).send({apiKey: params.apiKey}); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.post('/specificRequest', function(req, res) {
    var params = {};
    verifyApiKey(req.query.apiKey)
        .then(function(companyId) {
            params.companyId = companyId;
            Object.keys(req.body).forEach(function (k) {
                params[k] = req.body[k].toLowerCase();
            });
            return common.validateParams(params, [
                'targetSsn'
            ]);
        })
        .then(function() {
            // check that the target user exists
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user`,
                method: 'GET',
                qs: {
                    ssn: params.targetSsn
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject({apiError: `user with ssn ${params.targetSsn} does not exist in our database`});
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.ssn) {
                return Promise.reject({apiError: `user with ssn ${params.targetSsn} does not exist in our database`});
            }
            // check that is not a duplicate request
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/specificRequest`,
                method: 'GET',
                qs: {
                    targetSsn: params.targetSsn,
                    companyId: params.companyId
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (reqdata.state) {
                return Promise.reject({apiError: `a request for user ${params.targetSsn} already exists`});
            }
            // record the request
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/specificRequest`,
                method: 'POST',
                json: true,
                body: params
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body || !reqres.body[0]) {
                return Promise.reject();
            }
            res.status(201).send({apiMsg: `your specific request id is: ${reqres.body[0]}`}); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.get('/specificRequest', function(req, res) {
    var companyId;
    var allowed = ['id', 'state', 'targetSsn'];
    verifyApiKey(req.query.apiKey)
        .then(function(companyId_) {
            companyId = companyId_;
            return common.validateParams(req.query, allowed, allowed)
        })
        .then(function() {
            var where = {
                companyId: companyId
            };
            for (var q in req.query) {
                if (allowed.includes(q)) {
                    where[q] = req.query[q];
                }
            }
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
            var reqdata = JSON.parse(reqres.body)[0];
            return res.status(200).send(reqdata);
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.get('/specificRequest/data', function(req, res) {
    var companyId;
    verifyApiKey(req.query.apiKey)
        .then(function(companyId_) {
            companyId = companyId_;
            return common.validateParams(req.query, ['id'])
        })
        .then(function() {
            // check that the request is authorized
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/specificRequest`,
                method: 'GET',
                qs: {
                    id: req.query.id,
                    companyId: companyId
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject({apiError: `you have not made the request with id ${req.query.id}`});
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata || !reqdata.state) {
                return Promise.reject({apiError: `you have not made the request with id ${req.query.id}`});
            }
            if (reqdata.state === 'pending') {
                return Promise.reject({apiError: `this request must be authorized yet`});
            }
            else if (reqdata.state === 'rejected') {
                return Promise.reject({apiError: `this request has been rejected`});
            }
            if (reqdata.state !== 'authorized') {
                // we should never get here, right?
                return Promise.reject();
            }
            // send the data
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/infoPacket`,
                method: 'GET',
                qs: {
                    userSsn: reqdata.targetSsn
                }
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body) || '';
            if (!reqdata) {
                return Promise.reject();
            }
            res.status(200).send(reqdata); // success
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.post('/groupRequest', function(req, res) {
    var params = {}, filters = {}, requestId, companyId;
    verifyApiKey(req.query.apiKey)
        .then(function(companyId_) {
            companyId = companyId_;
            Object.keys(req.body).forEach(function (k) {
                params[k] = req.body[k].toLowerCase();
            });
            // parse the different filters
            var num, field, r;
            Object.keys(params).forEach(function(k) {
                r = k.match(/[0-9]*$/);
                num = r[0];
                if (!r[0]) {
                    num = '1';
                }
                if (!filters[num]) {
                    filters[num] = {};
                }
                field = k.substring(0, r.index);
                if (filters[num][field]) {
                    return Promise.reject({apiError: `invalid ${field}${num}; duplicate filter`})
                }
                filters[num][field] = params[k];
            });
            // verify them
            var promises = [], i = 0;
            Object.keys(filters).forEach(function(n) {
                promises[i++] = common.validateParams(filters[n], Object.keys(filters[n]), [], n);
            });
            return Promise.all(promises);
        })
        .then(function() {
            // count the users satisfying the filters
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/advancedSearch`,
				method: 'POST',
				json: true,
				body: {
					filters: filters,
					select: 'ssn'
				}
			})
        })
		.then(function(reqres) {
			if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
				return Promise.reject();
			}
			if (reqres.body.length < config.minUsersGroupRequest) {
				// maybe register the request too?
			    return Promise.reject({apiError: `request automatically rejected; filters too restrictive, at least ${config.minUsersGroupRequest} users must be included`});
            }
			// record the request
			params.companyId = companyId;
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/groupRequest`,
				method: 'POST',
				json: true,
				body: params
			})
		})
		.then(function(reqres) {
			if (!reqres || reqres.statusCode !== 200 || !reqres.body || !reqres.body[0]) {
				return Promise.reject();
			}
			requestId = reqres.body[0];
			// record its filters
			var promises = [];
			Object.keys(filters).forEach(function(filterKey) {
				promises.push(
					request({
						url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/filter`,
						method: 'POST',
						json: true,
						body: {
							companyId: companyId,
							requestId: requestId,
							filter: filters[filterKey]
						}
					})
				);
			});
			return Promise.all(promises);
		})
		.then(function(reqres) {
			for (var i = 0; i < reqres.length; i++) {
				var response = reqres[i];
				if (response.statusCode !== 200) {
					return Promise.reject();
				}
			}
			res.status(201).send({apiMsg: `your group request id is: ${requestId}`}); // success
		})
        .catch(function(err) {
            common.catchApi(err, res);
        })
});

router.get('/groupRequest', function(req, res) {
	var companyId, requests = [];
	var allowed = ['id', 'state'];
	verifyApiKey(req.query.apiKey)
		.then(function(companyId_) {
			companyId = companyId_;
			return common.validateParams(req.query, allowed, allowed)
		})
		.then(function() {
			var where = {
				companyId: companyId
			};
			for (var q in req.query) {
				if (allowed.includes(q)) {
					where[q] = req.query[q];
				}
			}
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/groupRequest`,
				method: 'GET',
				qs: where
			})
		})
		.then(function(reqres) {
			if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
				return Promise.reject();
			}
			requests = JSON.parse(reqres.body);
			// put the filters
			var promises = [];
			for (var i = 0; i < requests.length; i++) {
				promises.push(request({
					url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/filter`,
					method: 'GET',
					qs: {
						requestId: requests[i].id
					}
				}))
			}
			return Promise.all(promises);
		})
		.then(function(queryRes) {
			for (var i = 0; i < queryRes.length; i++) {
				requests[i].filters = JSON.parse(queryRes[i].body);
			}
			return res.status(200).send(requests);
		})
		.catch(function(err) {
			common.catchApi(err, res);
		})
});

router.get('/groupRequest/data', function(req, res) {
	var companyId, groupReq;
	verifyApiKey(req.query.apiKey)
		.then(function(companyId_) {
			companyId = companyId_;
			return common.validateParams(req.query, ['id'])
		})
		.then(function() {
			// check that the request is authorized
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/groupRequest`,
				method: 'GET',
				qs: {
					id: req.query.id,
					companyId: companyId
				}
			})
		})
		.then(function(reqres) {
			if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
				return Promise.reject({apiError: `you have not made the request with id ${req.query.id}`});
			}
			var reqdata = JSON.parse(reqres.body)[0] || '';
			if (!reqdata || !reqdata.state) {
				return Promise.reject({apiError: `you have not made the request with id ${req.query.id}`});
			}
			if (reqdata.state === 'pending') {
				return Promise.reject({apiError: `this request must be authorized yet`});
			}
			else if (reqdata.state === 'rejected') {
				return Promise.reject({apiError: `this request has been rejected`});
			}
			if (reqdata.state !== 'authorized') {
				// we should never get here, right?
				return Promise.reject();
			}
			groupReq = reqdata;
			// grab the filters
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/request/filter`,
				method: 'GET',
				qs: {
					requestId: groupReq.id
				}
			})
		})
		.then(function(reqres) {
			groupReq.filters = JSON.parse(reqres.body);
			// find the users who satisfy the filters
			return request({
				url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/advancedSearch`,
				method: 'POST',
				json: true,
				body: {
					filters: groupReq.filters,
					select: 'ssn'
				}
			})
		})
		.then(function(reqres) {
			if (reqres.body.length < config.minUsersGroupRequest) {
				return Promise.reject({apiError: `this data can no longer be available. please make a new request`});
				// todo set to rejected
			}
			// send the packets of every user
			var promises = [];
            for (var i = 0; i < reqres.body.length; i++) {
                promises.push(
                    request({
                        url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/infoPacket`,
                        method: 'GET',
                        qs: {
                            userSsn: reqres.body[i].ssn
                        }
                    })
                );
            }
			return Promise.all(promises);
		})
        .then(function(queryRes) {
            var data = [];
            for (var i = 0; i < queryRes.length; i++) {
                var reqdata = JSON.parse(queryRes[i].body);
                for (var j = 0; j < reqdata.length; j++) {
                    delete reqdata[j].userSsn;
                    delete reqdata[j].wearableMac;
                    data.push(reqdata[j]);
                }
            }
            // sort all data by the timestamp
            data.sort(function(a, b) {
                if (a.ts < b.ts) {
                    return -1;
                }
                else if (a.ts > b.ts) {
                    return 1;
                }
                return 0;
            });
            res.status(200).send(data);
            console.log(queryRes);
        })
		.catch(function(err) {
			common.catchApi(err, res);
		})
});

function generateAPIkey() {
    // todo check duplicate
    return common.randomString(40);
}

function verifyApiKey(key) {
    return new Promise(function(resolve, reject) {
        common.validateParams({apiKey: key}, [
            'apiKey',
        ])
            .then(function() {
                return request({
                    url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company`,
                    method: 'GET',
                    qs: {
                        apiKey: key
                    }
                })
            })
            .then(function(reqres) {
                if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                    return Promise.reject();
                }
                var reqdata = JSON.parse(reqres.body)[0] || '';
                if (!reqdata.id) {
                    return Promise.reject();
                }
                resolve(reqdata.id);
            })
            .catch(function(err) {
                reject({apiError: 'API key not authorized'});
            })
    });
}


module.exports = router;