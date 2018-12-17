var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../common/config.json');
var common = require('../../common/common');


router.post('/register', function(req, res) {
    /**
     * @api {post} /api/register User registration
     * @apiName RegisterUser
     * @apiGroup ApplicationServerMobileApp
     *
     * @apiParam {string} ssn
     * @apiParam {string} name
     * @apiParam {string} surname
     * @apiParam {string="male","female"} sex
     * @apiParam {string} birthDate Format: dd/mm/yyyy
     * @apiParam {string} state
     * @apiParam {string} country
     * @apiParam {string} city
     * @apiParam {string} zipcode
     * @apiParam {string} street
     * @apiParam {string} streetNr
     * @apiParam {string} mail
     * @apiParam {string} password
     *
     * @apiSuccess 201
     *
     * @apiError 400
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 400 Not Found
     *     unknown error occurred
     */

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
        'state',
        'country',
        'city',
        'zipcode',
        'street',
        'streetNr',
        'mail',
        'password'
    ])
        .then(function() { // todo check existing user
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
            url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}`,
            method: 'GET'
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
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/wearableDevice/ByMac/${params.macAddr}`,
                method: 'GET'
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

router.get('/:ssn/pendingRequests', function(req, res) {
    var pendingRequests = {};
    var ssn = req.params.ssn.toLowerCase();
    request({
        url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}/specificRequest`,
        method: 'GET'
    })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body) || '';
            if (!reqdata[0] || !reqdata[0].id) {
                res.status(200).send({}); // no requests
                return Promise.reject({noError: ''});
            }
            // get company information for every pending request
            var promises = [];
            for (var i = 0; i < reqdata.length; i++) {
                pendingRequests[i] = {};
                pendingRequests[i].requestId = reqdata[i].id;
                promises[i] = request({
                    url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/byId/${reqdata[i].companyId}`,
                    method: 'GET'
                })
            }
            return Promise.all(promises);
        })
        .then(function(rows) {
            // order is preserved
            for (var i = 0; i < rows.length; i++) {
                var companyData = JSON.parse(rows[i].body)[0];
                delete companyData.apiKey;
                pendingRequests[i].company = companyData;
            }
            res.status(200).send(pendingRequests);
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
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}/specificRequest/${params.id}`,
                method: 'GET'
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
            // change the request status to accepted
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}/acceptRequest/${params.id}`,
                method: 'GET'
            });
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
    var params = {};
    Object.keys(req.body).forEach(function(k) {
        params[k] = req.body[k].toLowerCase();
    });
    common.validateParams(params, [
        'ts',
        'wearableMac',
        'userSsn',
        'geoX',
        'geoY',
        'heartBeatRate',
        'bloodPressSyst',
        'bloodPressDias'
    ])
        .then(function() {
            // check that the incoming packet is legit
            params.wearableMac = params.wearableMac.replace(/[ -]/g, '');
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/wearableDevice/ByMac/${params.wearableMac}`,
                method: 'GET'
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject();
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.userSsn || reqdata.userSsn !== params.userSsn) {
                return Promise.reject('invalid wearableMac');
            }
            // todo check timestamp value!!!!!
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/registerInfoPacket`,
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
    var header = (req.headers['authorization'] || '').split(/Basic /)[1];
    // email, password, sessionToken
    var auth = new Buffer.from(header.split(/\s+/).pop() || '', 'base64').toString().split(/:/);
    new Promise(function(resolve, reject) {
        if (!ssn) { // case /login
            request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/getSsnFromMail`,
                method: 'POST',
                json: true,
                body: {
                    mail: auth[0]
                }
            })
                .then(function(row) {
                    ssn = row.body[0].ssn; // todo checks
                    resolve();
                })
                .catch(reject) // todo
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
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}/credentials`,
                method: 'GET'
            })
        })
        .then(function(reqres) {
            if (reqres.statusCode !== 200) {
                return Promise.reject({apiError: 'invalid ssn'});
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.ssn || reqdata.ssn !== ssn) {
                return Promise.reject({apiError: 'invalid ssn'});
            }
            if (auth[0] === reqdata.mail && common.genHash(auth[1]) === reqdata.password) {
                req.params.ssn = ssn; // DO NOT DELETE, this passes the ssn to next(). first line is not good for all cases
                next(); // success
            }
            else {
                res.status(401).end();
            }
        })
        .catch(function(err) {
            common.catchApi(err, res);
        })
}


module.exports = router;