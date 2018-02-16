var Sequelize = require('sequelize');

// Database Setup for localhost
var sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',

    pool: {
        max: 250,
        min: 0,
        idle: 10000,
    },
});

// Database Setup for aws elastic beanstalk
/*var sequelize = new Sequelize(process.env.RDS_DB_NAME, process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
    host: process.env.RDS_HOSTNAME,
    dialect: 'mysql',

    pool: {
        max: 250,
        min: 0,
        idle: 10000,
    },
});*/

module.exports = sequelize;
