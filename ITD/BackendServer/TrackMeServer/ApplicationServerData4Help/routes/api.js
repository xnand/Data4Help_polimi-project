var express = require('express');
var router = express.Router();
var bb = require("bluebird");
var request = bb.promisify(require('request'));
var config = require('../../config.json');
var hash = require('crypto').createHash('md5'); // to replace with pbkdf2/bcrypt/scrypt in production?


router.post('/register', function(req, res) {
    registerCompany(req.body)
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
                res.status(400).send('unknown error occurred');
            }
        });
});

function registerCompany() {
    return new Promise(function(resolve, reject) {
        var params = {};
        Object.keys(paramsOrig).forEach(function (k) {
            if (k !== 'password') {
                params[k] = paramsOrig[k].toLowerCase();
            }
            else {
                params.password = genHash(paramsOrig.password);
            }
        });
    })
}

module.exports = router;