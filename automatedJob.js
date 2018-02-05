var cron = require('node-cron');
const interval = 1; // in minutes
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
    repostToPicatic(count, data);
}

function repostToEventbrite(count, data) {

}

function repostToPicatic(count, data) {

    for (var i = 0; i < count; ++i) {
        console.log('in loop');
        var payload = {
            "data": {
                "attributes": {"title": data[i].title},
                "description": data[i].description,
                "start_date": new Date(data[i].startTime).toDateString(),
                "start_time": new Date(data[i].startTime).toLocaleTimeString(),
                "end_date": new Date(data[i].endTime).toDateString(),
                "end_time": new Date(data[i].endTime).toLocaleTimeString(),
                "type": "event"
            }
        };

        axios({
            method: 'post',
            url: 'https://api.picatic.com/v2/event',
            headers: {Authorization: "Bearer sk_live_5e31f0694e3511d11a78be831c043275"},
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
}