var cron = require('node-cron');
const interval = process.env.INTERVAL; // in minutes
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
                    "utc": new Date(data.endTime).toISOString().slice(0, 19) + 'Z'
                },
                "start": {
                    "timezone": "America/Los_Angeles",
                    "utc": new Date(data.startTime).toISOString().slice(0, 19) + 'Z'
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

function convertTo24Hour(time) {
    var hours = parseInt(time.substr(0, 2));
    if (time.indexOf('am') != -1 && hours == 12) {
        time = time.replace('12', '0');
    }
    if (time.indexOf('pm') != -1 && hours < 12) {
        time = time.replace(hours, (hours + 12));
    }
    return time.replace(/(am|pm)/, '');
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

    console.error(payload.data.attributes.end_time.split(" ")[1]);
    console.error(payload.data.attributes.start_time.split(" ")[1]);

    if (payload.data.attributes.end_time.split(" ")[1] !== null && payload.data.attributes.end_time.split(" ")[1] !== undefined) {
        payload.data.attributes.end_time = convertTo24Hour(payload.data.attributes.end_time.toLowerCase()).trim();
    }

    if (payload.data.attributes.start_time.split(" ")[1] !== null && payload.data.attributes.start_time.split(" ")[1] !== undefined) {
        payload.data.attributes.start_time = convertTo24Hour(payload.data.attributes.start_time.toLowerCase()).trim();
    }

    console.log(payload);

    axios({
        method: 'post',
        url: 'https://api.picatic.com/v2/event',
        headers: {Authorization: "Bearer " + process.env.PICATIC_API_KEY},
        data: payload,
    }).then((result) => {
        if (result.response && result.response.status !== 201) {
            console.error('REPOST_TO_PICATIC_FAILURE', result.response.data.errors);
        } else {
            console.log('REPOST_TO_PICATIC_SUCCESS');
        }
    }).catch((result) => {
        if (result.response) {
            console.error('REPOST_TO_PICATIC_FAILURE', result.response.data.errors);
        }
    });
}