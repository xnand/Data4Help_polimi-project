var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../config.json');

router.post('/register', function(req, res) {
    registerUser(req.body)
        .then(function() {
            res.status(201).end();
        })
        .catch(function(err) {
            if (typeof err === 'string' ) {
                res.status(400).send(err);
            }
            else {
                // not sending backend errors to client
                console.log(err);
                res.status(400).send('unknown error occurred; user not registered');
            }
        });
});

router.param('ssn', function (req, res, next) {
    var ssn = req.params.ssn.toLowerCase();
    if (!ssn.match(/^[0-9a-z]{16}$/)) {
        res.status(400).send('invalid ssn');
    }
    request({
        url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${ssn}`,
        method: 'GET'
    })
        .then(function(reqres) {
            if (reqres.statusCode === 200) {
                next();
            }
            else {
                response.statusCode(400).send('invalid ssn');
            }
        })
        .catch(function(reqerr) {
            res.statusCode(400).send('invalid ssn');
        })
});

router.post('/:ssn/registerWearable', function(req, res) {
    registerWearableDevice(req.body)
        .then(function() {
            res.status(201).end();
        })
        .catch(function(err) {
            if (typeof err === 'string' ) {
                res.status(400).send(err);
            }
            else {
                // not sending backend errors to client
                console.log(err);
                res.status(400).send('unknown error occurred; user not registered');
            }
        })
});

router.post('/:ssn/packet', function(req, res) {
    registerInfoPacket(req.body)
        .then(function() {
            res.status(201).end();
        })
        .catch(function(err) {
            if (typeof err === 'string') {
                res.status(400).send(err);
            }
            else {
                // not sending backend errors to client
                console.log(err);
                res.status(400).send('unknown error occurred; user not registered');
            }
        })
});

function registerUser(paramsOrig) {
    return new Promise(function(resolve, reject) {
        var params = {};
        Object.keys(paramsOrig).forEach(function(k) {
            params[k] = paramsOrig[k].toLowerCase();
        });
        if (params.ssn === undefined || !params.ssn.match(/^[0-9a-z]{16}$/)) {
            reject('invalid ssn. only alphanums == 16 chars allowed');
        } // TODO check existing
        if (params.name === undefined || !params.name.match(/^[0-9a-z']{1,32}$/)) {
            reject('invalid name. must <= 32 chars');
        }
        if (params.surname === undefined || !params.surname.match(/^[0-9a-z']{1,32}$/)) {
            reject('invalid name. must be alphanum <= 32 chars');
        }
        if (params.sex === undefined || (params.sex[0] !== 'm' && params.sex[0] !== 'f')) {
            reject('invalid sex. male of female allowed');
        }
        if (params.birthDate === undefined ||
            !params.birthDate.match(/^([0-9]{1,2}[ /-]){2}[0-9]{4}$/) ||
            new Date(params.birthDate).getTime() >= Date.now()) {
            reject('invalid date.');
        }
        if (params.state === undefined) {
            reject('invalid state');
        }
        if (params.country === undefined) {
            reject('invalid country');
        }
        if (params.city === undefined) {
            reject('invalid city');
        }
        if (params.zipcode === undefined || !params.zipcode.match(/[0-9]{1,10}/)) {
            reject('invalid zipcode');
        }
        if (params.street === undefined) {
            reject('invalid street');
        }
        if (params.streetNr === undefined || !params.streetNr.match(/[0-9]/)) {
            reject('invalid street number');
        }
        params.sex = params.sex.replace(/^m.*/g, 'male').replace(/^f.*/g, 'female');
        request({
            url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/register`,
            method: 'POST',
            json: true,
            body: params
        })
            .then(function(reqres) {
                if (reqres.statusCode === 200) {
                    return resolve();
                }
                return reject();
            })
            .catch(function(reqerr) {
                return reject();
            });
    })
}

function registerWearableDevice(paramsOrig) {
    return new Promise(function(resolve, reject) {
        var params = {};
        Object.keys(paramsOrig).forEach(function(k) {
            params[k] = paramsOrig[k].toLowerCase();
        });
        // validate
        if (params.macAddr === undefined || !params.macAddr.match(/^([0-9a-f]{2}[ -:]?){5}[0-9a-f]{2}$/)) {
            return reject('invalid mac address');
        }
        params.macAddr = params.macAddr.replace(/[ -]/g, '');
        // check if the wearable is already registered
        request({
            url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/wearableDeviceByMacAddr/${params.macAddr}`,
            method: 'GET'
        })
            .then(function(reqres) {
                if (reqres.statusCode === 200) {
                    var reqdata = JSON.parse(reqres.body);
                    if (reqdata.length !== 0) {
                        return Promise.reject('device already registered');
                    }
                    return Promise.resolve();
                }
                return Promise.reject();
            })
            .then(function() {
                return request({
                    url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/registerWearable`,
                    method: 'POST',
                    json: true,
                    body: params
                })}
            )
            .then(function(reqres) {
                if (reqres.statusCode === 200) {
                    return resolve();
                }
                return Promise.reject();
            })
            .catch(function(err) {
                return reject(err);
            });
    })
}

function registerInfoPacket(paramsOrig) {
    return new Promise(function(resolve, reject) {
        // validate
        var params = {};
        Object.keys(paramsOrig).forEach(function(k) {
            params[k] = paramsOrig[k].toLowerCase();
        });
        if (params.ts === undefined || !params.ts.match(/^[0-9]$/)) { // todo check timestamp value
            reject('invalid timestamp');
        }
        if (params.wearableMac === undefined || !params.wearableMac.match(/^([0-9a-f]{2}[ -:]?){5}[0-9a-f]{2}$/)) {
            reject('invalid mac address');
        }
        if (params.userSsn === undefined || !params.userSsn.match(/^[0-9a-z]{16}$/)) {
            reject('invalid ssn');
        }
        if (params.geoX === undefined || !params.geoX.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
            reject('invalid X geo');
        }
        if (params.geoY === undefined || !params.geoY.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
            reject('invalid Y geo');
        }
        // these parameters can be not specified (eg. wearable support)
        if (params.heartBeatRate != undefined && !params.heartBeatRate.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
            reject('invalid heartbeat rate')
        }
        if (params.bloodPressSyst != undefined && !params.bloodPressSyst.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
            reject('invalid syst blood pressure');
        }
        if (params.bloodPressDias != undefined && !params.bloodPressDias.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
            reject('invalid dias blood pressure');
        }
        // check that the incoming packet is legit

    })
}

module.exports = router;