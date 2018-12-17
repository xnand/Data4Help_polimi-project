var express = require('express');
var router = express.Router();
var knex = require('../knex');


router.get('', function(req, res) {
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('user').select().where(where)
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/credentials', function(req, res) {
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('userCredentials').select().where(where)
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/wearableDevice', function(req, res) {
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('wearableDevice').select().where(where)
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/infoPacket', function(req, res) {
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('infoPacket').select().where(where)
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/register', function(req, res) {
    var params = req.body;
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
        .then(function() {
            return knex('userCredentials').insert({
                ssn: params.ssn,
                mail: params.mail,
                password: params.password
            })
        })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/registerWearable', function(req, res) {
    var params = req.body;
    knex('wearableDevice').insert({
        macAddr: params.macAddr,
        userSsn: params.ssn
    })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/infoPacket', function(req, res) {
    var params = req.body;
    knex('infoPacket').insert({
        ts: params.ts,
        wearableMac: params.wearableMac,
        userSsn: params.userSsn,
        geoX: params.geoX,
        geoY: params.geoY,
        heartBeatRate: params.heartBeatRate,
        bloodPressSyst: params.bloodPressSyst,
        bloodPressDias: params.bloodPressDias
    })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/acceptRequest', function(req, res) {
    var params = req.body;
    knex('specificRequest').update({
        state: 'authorized'
    })
        .where({
            targetSsn: params.ssn,
            state: 'pending',
            id: params.id
        })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

module.exports = router;
