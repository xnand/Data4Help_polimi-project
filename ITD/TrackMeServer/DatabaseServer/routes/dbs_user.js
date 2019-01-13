var express = require('express');
var router = express.Router();
var knex = require('../knex');
var dateFormat = require('dateformat');

// get users
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

// get users, more in depth filtering
router.post('/advancedSearch', function(req, res) {
	var filters = req.body.filters || '';
	var select = req.body.select || '*'; // the field[s] to return
	var query = knex('user').select(select);
	var where = [''];
	var birth;
	var firstFilter = true;
	Object.keys(filters).forEach(function(filterKey) {
		var filter = filters[filterKey];
		if (firstFilter) {
			firstFilter = false;
			where[0] += ' (';
		}
		else {
			where[0] += ' OR (';
		}
		var firstField = true;
		Object.keys(filter).forEach(function(fieldKey) {
			if (!filters[filterKey][fieldKey] || [
				'id',
				'companyId',
				'requestId'
			].includes(fieldKey)) {
				return;
			}
			if (!firstField) {
				where[0] += ' AND ';
			}
			switch (fieldKey) {
				case 'ageStart':
					birth = new Date();
					birth.setYear(birth.getFullYear() - filters[filterKey][fieldKey]);
					where[0] += '"birthDate" <= ?';
					where.push(dateFormat(birth, 'mm/dd/yyyy'));
					break;
				case 'ageEnd':
					birth = new Date();
					birth.setYear(birth.getFullYear() - filters[filterKey][fieldKey]);
					where[0] += '"birthDate" >= ?';
					where.push(dateFormat(birth, 'mm/dd/yyyy'));
					break;
				default:
					where[0] += `"${fieldKey}" = ?`;
					where.push(filters[filterKey][fieldKey]);
					break;
			}
			firstField = false;
		});
		where[0] += ')';
	});
	query.where(knex.raw(where.splice(0,1)[0], where))
		.then(function(queryRes) {
			res.status(200).send(queryRes);
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// get users mail & hash(password)
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

// get user wearable devices
router.get('/wearableDevice', function(req, res) {
    var where = {
    	active: true
	};
    for (var q in req.query) {
        where[q] = req.query[q];
    }
    knex('wearableDevice').select().where(where)
        .then(function(queryRes) {
			for (var i = 0; i < queryRes.length; i++) {
				delete queryRes[i].active;
			}
            res.status(200).send(queryRes);
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

// get all user wearable devices, also the deactivated ones
router.get('/allWearableDevice', function(req, res) {
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

// get user info packets
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

// record a user
router.post('/register', function(req, res) {
    var params = req.body;
    knex('user').insert({
        ssn: params.ssn,
        name: params.name,
        surname: params.surname,
        sex: params.sex,
        birthDate: params.birthDate,
        country: params.country,
        region: params.region,
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

// record a wearable device
router.post('/registerWearable', function(req, res) {
    var params = req.body;
    knex('wearableDevice').select().where({
		macAddr: params.macAddr
	})
		.then(function(queryres) {
			if (queryres.length > 0 && queryres[0].active === false) {
				// wearable previously registered then deactivated
				var update = {active: true};
				if (params.name) {
					update.name = params.name
				}
				return knex('wearableDevice').update(update)
					.where({
					macAddr: params.macAddr,
				})
			}
			else {
				return knex('wearableDevice').insert({
					macAddr: params.macAddr,
					name: params.name,
					userSsn: params.ssn
				})
			}
		})
		.then(function() {
			res.status(200).end();
		})
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

// unregister a wearable device
router.post('/unregisterWearable', function(req, res) {
	var params = req.body;
	knex('wearableDevice').update({
		active: false
	}).where({
		macAddr: params.macAddr,
	})
		.then(function() {
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(400).end();
		});
});

// record a info packet
router.post('/infoPacket', function(req, res) {
    var params = req.body;
    knex('infoPacket').insert({
        ts: params.ts,
        wearableMac: params.wearableMac,
        userSsn: params.userSsn,
        geoX: params.geoX,
        geoY: params.geoY,
        heartBeatRate: params.heartBeatRate || '',
        bloodPressSyst: params.bloodPressSyst || '',
        bloodPressDias: params.bloodPressDias || '',
		emergency: params.emergency || false
    })
        .then(function() {
            res.status(200).end();
        })
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        });
});

// change state of specific request to authorized
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

// change state of specific request to rejected
router.post('/rejectRequest', function(req, res) {
	var params = req.body;
	knex('specificRequest').update({
		state: 'rejected'
	})
		.where({
			targetSsn: params.ssn,
			state: 'pending',
			id: params.id
		})
		.orWhere({
			targetSsn: params.ssn,
			state: 'authorized',
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
