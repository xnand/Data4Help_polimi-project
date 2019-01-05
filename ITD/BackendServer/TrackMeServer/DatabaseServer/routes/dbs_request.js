var express = require('express');
var router = express.Router();
var knex = require('../knex');


// get specific requests
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

// record a specific request
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

// subscribe to a specific request
router.post('/specificRequest/subscribe', function(req, res) {
	var params = req.body;
	knex('specificRequest').update({
		subscription: true,
		subscriptionForwardingLink: params.forwardingLink
	}).where({
		id: params.requestId,
	})
		.then(function() {
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// unsubscribe to a specific request
router.post('/specificRequest/disableSubscription', function(req, res) { // todo, unused
	var params = req.body;
	knex('specificRequest').update({
		subscription: false,
		subscriptionForwardingLink: null
	}).where({
		id: params.requestId,
	})
		.then(function() {
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// get group requests
router.get('/groupRequest', function(req, res) {
	var where = {};
	for (var q in req.query) {
		if (q === 'targetSsn') {
			continue;
		}
		where[q] = req.query[q];
	}
	var query;
	if (!req.query.targetSsn) {
		query = knex('groupRequest').select().where(where);
	}
	else {
		query = knex('groupRequest').select().where(where).whereRaw('? = ANY (targets)', req.query.targetSsn);
	}
	query
		.then(function(queryRes) {
			res.status(200).send(queryRes);
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// record a group request
router.post('/groupRequest', function(req, res) {
	var params = req.body;
	knex('groupRequest').insert({
		companyId: params.companyId,
		state: 'authorized',
		targets: params.targets
	}, 'id')
		.then(function(queryRes) {
			res.status(200).send(queryRes);
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// subscribe to a group request
router.post('/groupRequest/subscribe', function(req, res) {
	var params = req.body;
	knex('groupRequest').update({
		subscription: true,
		subscriptionForwardingLink: params.forwardingLink
	}).where({
		id: params.requestId
	})
		.then(function() {
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// unsubscribe to a group request
router.post('/groupRequest/disableSubscription', function(req, res) { // todo, unused
	var params = req.body;
	knex('groupRequest').update({
		subscription: false,
		subscriptionForwardingLink: null
	}).where({
		id: params.requestId
	})
		.then(function() {
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// get filters belonging to a group request
router.get('/filter', function(req, res) {
	var where = {};
	for (var q in req.query) {
		where[q] = req.query[q];
	}
	knex('filter').select().where(where)
		.then(function(queryRes) {
			res.status(200).send(queryRes);
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// record a filter belonging to a group request
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