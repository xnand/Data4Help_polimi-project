var express = require('express');
var router = express.Router();
var knex = require('../DatabaseServer/knex');

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
    knex('user').select().where('ssn', ssn)
        .then(function(row) {
            if (row.length === 0) {
                res.status(400).send(`user with ssn ${ssn} does not exist`);
            }
            next();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).send('unknown error');
        })
});

router.post('/:ssn/registerWearable', function(req, res) {
    registerWearableDevice(req.body, req.params.ssn)
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
        // validate
        var params = [];
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
        // record
        knex('user').insert({
            ssn: params.ssn,
            name: params.name,
            surname: params.surname,
            sex: params.sex,
            birthDate: params.birthDate,
            state: params.state,
            country: params.country,
            city: params.city,
            zipcode: params.zipcode,
            street: params.street,
            streetNr: params.streetNr
        })
            .then(resolve)
            .catch(reject);
    })
}

function registerWearableDevice(paramsOrig, ssn) {
    return new Promise(function(resolve, reject) {
        var params = [];
        Object.keys(paramsOrig).forEach(function(k) {
            params[k] = paramsOrig[k].toLowerCase();
        });
        // validate
        if (params.macAddr === undefined || !params.macAddr.match(/^([0-9a-f]{2}[ -:]?){5}[0-9a-f]{2}$/)) {
            reject('invalid mac address');
        }
        params.macAddr = params.macAddr.replace(/[ -]/g, ':');
        // check if the wearable is already registered
        knex('wearableDevice').select('userSsn').where('macAddr', params.macAddr)
            .then(function(row) {
                if (row.length !== 0) {
                    if (row[0].userSsn !== ssn) {
                        reject('this device is already registered to another user');
                    }
                    else if (row[0].userSsn === ssn) {
                        reject('this device is already registered');
                    }
                }
            });
        // record
        knex('wearableDevice').insert({
            macAddr: params.macAddr,
            userSsn: ssn.toLowerCase()
        })
            .then(resolve)
            .catch(reject);
    })
}

function registerInfoPacket(paramsOrig) {
    return new Promise(function(resolve, reject) {
        // validate
        var params = [];
        Object.keys(paramsOrig).forEach(function(k) {
            params[k] = paramsOrig[k].toLowerCase();
        });

    })
}

module.exports = router;
