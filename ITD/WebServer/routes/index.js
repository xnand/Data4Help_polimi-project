var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'TrackMe Home Page' });
});

router.get('/documentation', function(req, res, next) {
    res.render('documentation', { title: 'TrackMe Documentation' });
});

router.get('/register', function(req, res, next) {
    res.render('register', { title: 'TrackMe Registration' });
});

module.exports = router;
