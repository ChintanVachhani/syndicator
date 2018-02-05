var express = require('express');
var router = express.Router();
var Event = require('../models/event');

/* GET dashboard page. */
router.get('/', function (req, res, next) {
    Event.findAndCountAll()
        .then((events) => {
            if (events.count) {
                res.render('dashboard', {
                    title: 'Syndicator',
                    activePage: 'dashboard',
                    eventsCount: events.count,
                    notification: null
                });
            } else {
                res.render('dashboard', {
                    title: 'Syndicator',
                    activePage: 'dashboard',
                    eventsCount: 0,
                    notification: null
                });
            }
        });
});

router.post('/', function (req, res, next) {

    var notification;

    var event = {
        title: req.body.eventTitle,
        description: req.body.eventDescription,
        startTime: req.body.eventStartTime,
        endTime: req.body.eventEndTime
    };

    if (Date.parse(event.startTime) >= Date.parse(event.endTime)) {
        notification = {message: 'Invalid dates.', type: 'danger'};
    } else {
        Event.create(event)
            .then((event) => {
                if (event) {
                    notification = {message: 'Event successfully created.', type: 'success'};
                    console.log({
                        message: 'Event successfully created.',
                        id: event.id,
                        notification: notification
                    });
                } else {
                    notification = {message: 'Event cannot be created.', type: 'danger'};
                    console.log({
                        title: 'Event cannot be created.',
                        error: {message: 'Invalid data.'},
                        notification: notification
                    });
                }
            });
    }

    Event.findAndCountAll()
        .then((events) => {
            if (events.count) {
                res.render('dashboard', {
                    title: 'Syndicator',
                    activePage: 'dashboard',
                    eventsCount: events.count,
                    notification: notification
                });
            } else {
                res.render('dashboard', {
                    title: 'Syndicator',
                    activePage: 'dashboard',
                    eventsCount: 0,
                    notification: notification
                });
            }
        });
});

module.exports = router;
