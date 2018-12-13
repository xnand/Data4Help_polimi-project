var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../common/config.json');
var common = require('../../common/common');


router.post('/register', function(req, res) {
    registerCompany(req.body)
        .then(function(apiKey) {
            res.status(201).send(apiKey);
        })
        .catch(function(err) {
            if (typeof err === 'string') {
                res.status(400).send(err);
            }
            else {
                // not sending backend errors to client
                console.log(err);
                res.status(400).send('unknown error occurred');
            }
        });
});

router.post('/specificRequest', function(req, res) {
    registerSpecificRequest(req.body)
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
                res.status(400).send('unknown error occurred');
            }
        });
});

function registerCompany(paramsOrig) {
    return new Promise(function(resolve, reject) {
        var params = {};
        Object.keys(paramsOrig).forEach(function (k) {
            params[k] = paramsOrig[k].toLowerCase();
        });
        if (params.vat === undefined || !params.vat.match(/^[0-9a-z ]{1,11}$/)) {
            reject('invalid vat');
        }
        if (params.name === undefined) {
            reject('invalid name');
        }
        request({
            url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/byVat/${params.vat}`,
            method: 'GET'
        })
            .then(function(reqres) {
                if (reqres.statusCode === 200) {
                    var reqdata = JSON.parse(reqres.body)[0];
                    if (!reqdata || reqdata.length === 0) {
                        return Promise.resolve();
                    }
                    else if (reqdata && reqdata.id) {
                        return Promise.reject('company with this vat already registered');
                    }
                }
                return Promise.reject();
            })
            .then(function() {
                params.apiKey = generateAPIkey();
                return request({
                    url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/register`,
                    method: 'POST',
                    json: true,
                    body: params
                })
            })
            .then(function(reqres) {
                if (reqres.statusCode === 200) {
                    return resolve(params.apiKey);
                }
                return Promise.reject();
            })
            .catch(function(err) {
                return reject(err);
            });
    })
}

function registerSpecificRequest(paramsOrig) {
    return new Promise(function(resolve, reject) {
        var params = {};
        Object.keys(paramsOrig).forEach(function(k) {
            if (k !== 'apiKey') {
                params[k] = paramsOrig[k].toLowerCase();
            }
            else {
                params.apiKey = common.genHash(paramsOrig.apiKey);
            }
        });
        if (params.apiKey === undefined || !params.apiKey.match(/^[a-zA-Z0-9]{40}$/)) {
            //todo!
        }
    })
}

function generateAPIkey() {
    // todo check duplicate
    return common.randomString(40);
}


module.exports = router;