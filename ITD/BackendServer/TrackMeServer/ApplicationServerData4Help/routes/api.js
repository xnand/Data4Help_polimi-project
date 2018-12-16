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
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/byVat/${params.vat}`,
                method: 'GET'
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
    Object.keys(req.body).forEach(function (k) {
        if (k !== 'apiKey') {
            params[k] = req.body[k].toLowerCase();
        }
        else {
            params.apiKey = req.body.apiKey;
        }
    });
    common.validateParams(params, [
        'apiKey',
        'targetSsn'
    ])
        .then(function() {
            // check API key and obtain id
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/byAPI/${params.apiKey}`,
                method: 'GET'
            })
        })
        .then(function(reqres) {
            if (!reqres || reqres.statusCode !== 200 || !reqres.body) {
                return Promise.reject({apiError: 'apiKey not authorized'});
            }
            var reqdata = JSON.parse(reqres.body)[0] || '';
            if (!reqdata.id) {
                return Promise.reject({apiError: 'apiKey not authorized'});
            }
            params.companyId = reqdata.id;
            // check that the target user exists
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/user/${params.targetSsn}`,
                method: 'GET'
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
            // record the request
            return request({
                url: `http://${config.address.databaseServer}:${config.port.databaseServer}/company/specificRequest`,
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

function generateAPIkey() {
    // todo check duplicate
    return common.randomString(40);
}


module.exports = router;