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
    }, 'id')
        .then(function(queryRes) {
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

router.post('/groupRequest', function(req, res) {
	var params = req.body;
	knex('groupRequest').insert({
		companyId: params.companyId,
		state: 'authorized',
	}, 'id')
		.then(function(queryRes) {
			res.status(200).send(queryRes);
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

router.post('/filter', function(req, res) {
	var params = req.body;
	knex('filter').insert({
		requestId: params.requestId,
		companyId: params.companyId,
		ageStart: params.filter.ageStart || null,
		ageEnd: params.filter.ageEnd || null,
		country: params.filter.country || null,
		region: params.filter.region || null,
		city: params.filter.city || null,
		zipcode: params.filter.zipcode || null,
		street: params.filter.street || null,
		streetNr: params.filter.streetNr || null
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