var config = require('../common/config.json');
var dbConnection = process.env.DATABASE_URL || config.address.dbms ||"127.0.0.1";

config = {
    client: 'pg',
    version: '7.2',
    connection: {
        host: dbConnection,
        user: 'trackme', // TODO change in trackme or something
        // password : 'your_database_password', TODO
        database: 'trackmedb'
    }
};

module.exports = require('knex')(config);
