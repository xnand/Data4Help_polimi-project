var express = require('express');
var router = express.Router();
var knex = require('../knex');

router.g
et('', function(req, res) { // /api/company
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('company').select().where(where)
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


module.exports = router;