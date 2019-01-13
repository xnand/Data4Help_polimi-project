var express = require('express');
var router = express.Router();
var knex = require('../knex');
var fs = require('fs');


// get companies
router.get('', function(req, res) { // /api/company
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

// record a company into db
router.post('/register', function(req, res) {
    var params = req.body;
    if (params.image) {
        // save company's image
        var image = Buffer.from(params.image, 'base64');
        knex('company').select(knex.raw('MAX(id)'))
			.then(function(res) {
				var id;
				if (!res[0].max) {
					id = 1;
				}
				else {
					id = res[0].max + 1;
				}
				var imagePath = `DatabaseServer/assets/companyImage/${id}.png`;
				if (fs.existsSync(imagePath)) {
					// delete previous image if exists
					fs.unlinkSync(imagePath);
				}
				fs.writeFileSync(imagePath, image);
			});
    }
    knex('company').insert({
        vat: params.vat,
        name: params.name,
		businessSector: params.businessSector,
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

router.get('/image/:id', function(req, res) {
	var filePath = `DatabaseServer/assets/companyImage/${req.params.id}.png`;
	if (fs.existsSync(filePath)) {
		res.status(200).sendfile(filePath)
	}
	else {
		res.status(404).end();
	}
});


module.exports = router;