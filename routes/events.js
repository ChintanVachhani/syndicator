var express = require('express');
var router = express.Router();
var Event = require('../models/event');

/* GET events listing. */
router.get('/', function (req, res, next) {
    Event.findAll()
        .then((events) => {
            if (events) {
                res.render('events', {
                    message: 'Events retrieved successfully.',
                    data: events,
                    title: 'Syndicator',
                    activePage: 'events'
                });
            } else {
                res.render('events', {
                    message: 'Cannot retrieve events.',
                    error: {message: 'Internal server error.'},
                    title: 'Syndicator',
                    activePage: 'events'
                });
            }
        });
});

module.exports = router;
