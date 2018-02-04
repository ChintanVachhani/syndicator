var Sequelize = require('sequelize');
var serverConfig = require('./config');

// Database Setup
var sequelize = new Sequelize(serverConfig.database.name, serverConfig.database.username, serverConfig.database.password, {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 250,
    min: 0,
    idle: 10000,
  },
});
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
