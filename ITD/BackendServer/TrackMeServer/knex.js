var serverPort = process.env.PORT || 5000;
var dbConnection = process.env.DATABASE_URL || "127.0.0.1";

config = {
    client: 'pg',
    version: '7.2',
    connection: {
        host: dbConnection,
        user: 'andrei', // TODO change in trackme or something
        // password : 'your_database_password', TODO
        database: 'trackmedb'
    }
};

module.exports = require('knex')(config);
