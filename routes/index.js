var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Syndicator', activePage: 'dashboard', eventsCount: 0});
});

/* GET events page. */
router.get('/events', function(req, res, next) {
    res.render('events', { title: 'Syndicator', activePage: 'events'});
});

module.exports = router;
