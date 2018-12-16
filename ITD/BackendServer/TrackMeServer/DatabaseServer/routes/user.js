var express = require('express');
var router = express.Router();
var knex = require('../knex');

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

router.get('/:ssn', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    knex('user').select().where('ssn', ssn)
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/:ssn/credentials', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    knex('userCredentials').select().where('ssn', ssn)
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/:ssn/specificRequest', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    knex('specificRequest').select().where({
        targetSsn: ssn,
        state: 'pending'
    })
        .then(function(rows) {
            res.status(200).send(rows);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/:ssn/specificRequest/:id', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    knex('specificRequest').select().where({
        targetSsn: ssn,
        state: 'pending'
    })
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/:ssn/acceptRequest/:id', function(req, res) {
    var ssn = req.params.ssn.toLowerCase();
    var id = req.params.id;
    knex('specificRequest').update({
        state: 'authorized'
    })
        .where({
        targetSsn: ssn,
        state: 'pending',
        id: id
    })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/getSsnFromMail', function(req, res) {
    // this is not in standard form /ssn/byMail/.. because
    // is the mail address is not http encode friendly
    var params = req.body;
    knex('userCredentials').select('ssn').where('mail', params.mail)
        .then(function(row) {
            res.status(200).send(row);
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

router.get('/wearableDevice/ByMac/:macAddr', function(req, res) {
    var macAddr = req.params.macAddr.toLowerCase();
    knex('wearableDevice').select().where('macAddr', macAddr)
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/registerInfoPacket', function(req, res) {
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

module.exports = router;
