var cron = require('node-cron');
const interval = 30; // in minutes
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var Event = require('./models/event');

var firstTime = true;
var lastIntervalTime;

var axios = require('axios');

cron.schedule('*/' + interval + ' * * * *', function () {
    var currentIntervalTime;
    if (firstTime) {
        currentIntervalTime = new Date(new Date().toUTCString());
        console.log('Time: ' + currentIntervalTime);
        Event.findAndCountAll({
            where: {
                createdAt: {
                    [Op.lte]: currentIntervalTime,
                }
            }
        }).then(events => {
            console.log('Count: ', events.count);
            // console.log('Data: ', events.rows);
            syndicate(events.count, events.rows);
            firstTime = false;
            lastIntervalTime = currentIntervalTime;
        });
    } else {
        currentIntervalTime = new Date(new Date().toUTCString());
        console.log('Time: ' + currentIntervalTime);
        Event.findAndCountAll({
            where: {
                createdAt: {
                    [Op.between]: [lastIntervalTime, currentIntervalTime],
                }
            }
        }).then(events => {
            console.log('Count: ', events.count);
            // console.log('Data: ', events.rows);
            syndicate(events.count, events.rows);
            lastIntervalTime = currentIntervalTime;
        });
    }
});

function syndicate(count, data) {
    for (var i = 0; i < count; ++i) {
        repostToEventbrite(data[i]);
        repostToPicatic(data[i]);
    }
}

function repostToEventbrite(data) {
    var payload =
        {
            "event": {
                "name": {"html": data.title},
                "description": {"html": data.description},
                "end": {
                    "timezone": "America/Los_Angeles",
                    "utc": new Date(data.endTime).toISOString().slice(0,19) + 'Z'
                },
                "start": {
                    "timezone": "America/Los_Angeles",
                    "utc": new Date(data.startTime).toISOString().slice(0,19) + 'Z'
                },
                "currency": "USD"
            }
        };

    axios({
        method: 'post',
        url: 'https://www.eventbriteapi.com/v3/events/',
        headers: {Authorization: "Bearer " + process.env.EVENTBRITE_API_KEY},
        data: payload,
    }).then((result) => {
        if (result.response && result.response.status !== 201) {
            console.error('REPOST_TO_EVENTBRITE_FAILURE');
        } else {
            console.log('REPOST_TO_EVENTBRITE_SUCCESS');
        }
    }).catch((result) => {
        if (result.response) {
            console.error('REPOST_TO_EVENTBRITE_FAILURE');
        }
    });
}

function repostToPicatic(data) {
    var payload = {
        "data": {
            "attributes": {
                "title": data.title,
                "description": data.description,
                "end_date": new Date(data.endTime).toISOString().slice(0, 10),
                "end_time": new Date(data.endTime).toLocaleTimeString(),
                "start_date": new Date(data.startTime).toISOString().slice(0, 10),
                "start_time": new Date(data.startTime).toLocaleTimeString()
            }, "type": "event"
        }
    };
    axios({
        method: 'post',
        url: 'https://api.picatic.com/v2/event',
        headers: {Authorization: "Bearer " + process.env.PICATIC_API_KEY},
        data: payload,
    }).then((result) => {
        if (result.response && result.response.status !== 201) {
            console.error('REPOST_TO_PICATIC_FAILURE');
        } else {
            console.log('REPOST_TO_PICATIC_SUCCESS');
        }
    }).catch((result) => {
        if (result.response) {
            console.error('REPOST_TO_PICATIC_FAILURE');
        }
    });
}