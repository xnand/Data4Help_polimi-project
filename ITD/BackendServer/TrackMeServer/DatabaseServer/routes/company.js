var express = require('express');
var router = express.Router();
var knex = require('../knex');


router.post('/register', function(req, res) {
    var params = req.body;
    knex('company').insert({
        vat: params.vat,
        name: params.name,
        apiKey: params.apiKey
    })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/byVat/:vat', function(req, res) {
    var vat = req.params.vat.toLowerCase();
    knex('company').select().where('vat', vat)
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.get('/byId/:id', function(req, res) {
    var id = req.params.id.toLowerCase();
    knex('company').select().where('id', id)
        .then(function(row) {
            res.status(200).send(row);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

module.exports = router;