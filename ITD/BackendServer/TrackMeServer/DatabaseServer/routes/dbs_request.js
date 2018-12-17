var express = require('express');
var router = express.Router();
var knex = require('../knex');


router.get('/specificRequest', function(req, res) {
    var where = {};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('specificRequest').select().where(where)
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/specificRequest', function(req, res) {
    var params = req.body;
    knex('specificRequest').insert({
        companyId: params.companyId,
        state: 'pending',
        targetSsn: params.targetSsn
    })
        .then(function() {
            // return the id of the request
            return knex('specificRequest').select().where({
                companyId: params.companyId,
                targetSsn: params.targetSsn
            })
        })
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});


module.exports = router;