var cron = require('node-cron');
var interval = 5; // in minutes
var Sequelize = require('sequelize');
const Op = Sequelize.Op;
var Event = require('./models/event');

var firstTime = true;
var lastIntervalTime;

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
            lastIntervalTime = currentIntervalTime;
        });
    }
});