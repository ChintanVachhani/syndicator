var Sequelize = require('sequelize');
var sequelize = require('../mysql');

var Event = sequelize.define('event', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING
    },
    startTime: {
        type: Sequelize.DATE,
        allowNull: false
    },
    endTime: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

Event.sync()
    .then(() => {
        console.log("'events' table successfully created.")
    })
    .catch(() => {
        console.log("'events' table already exists or cannot be created.")
    });

module.exports = Event;