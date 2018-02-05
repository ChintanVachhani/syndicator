var cron = require('node-cron');
const interval = 1; // in minutes
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var Event = require('./models/event');

var firstTime = true;
var lastIntervalTime;

var axios = require('axios');

var tokens = require('tokens');

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
            console.log('Data: ', events.rows);
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
            console.log('Data: ', events.rows);
            syndicate(events.count, events.rows);
            lastIntervalTime = currentIntervalTime;
        });
    }
});

function syndicate(count, data) {
    for (var i = 0; i < count; ++i) {
        repostToPicatic(data[i]);
    }
}

function repostToEventbrite(data) {

}

function repostToPicatic(data) {
    var payload = {
        "data": {
            "attributes": {"title": data.title},
            "description": data.description,
            "start_date": new Date(data.startTime).toLocaleDateString(),
            "start_time": new Date(data.startTime).toLocaleTimeString(),
            "end_date": new Date(data.endTime).toLocaleDateString(),
            "end_time": new Date(data.endTime).toLocaleTimeString(),
            "type": "event"
        }
    };

    axios({
        method: 'post',
        url: 'https://api.picatic.com/v2/event',
        headers: {Authorization: "Bearer " + tokens.picatic},
        data: payload,
    })
        .then((result) => {
            if (result.response && result.response.status !== 201) {
                console.error({
                    type: SIGNUP_FAILURE,
                    response: result.response.data.title + ' ' + result.response.data.error.message,
                });
            } else {
                console.log({
                    type: SIGNUP_SUCCESS,
                    response: result.data.userId,
                });
            }
        }).catch((result) => {
        if (result.response) {
            console.error({
                type: SIGNUP_FAILURE,
                response: result.response.data.title + ' ' + result.response.data.error.message,
            });
        }
    });
}