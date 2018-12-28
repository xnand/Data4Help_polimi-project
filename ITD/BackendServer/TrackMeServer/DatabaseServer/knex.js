var config = require('../common/config.json');
var dbConnection = {};
if (config.postgres.useHeroku === 'true' || process.env.USEHEROKUPG) {
    dbConnection = {
        host: 'ec2-54-247-74-131.eu-west-1.compute.amazonaws.com',
        user: 'hkuexxpfzlulri',
        password: '75fa8e20a89623a9dcf42c5c66e715a2770e567acf4a96689b532ef090c3d71e',
        database: 'dcg8qm6jk3l7la',
        ssl: true
    }
}
else {
    dbConnection = {
        host: process.env.DATABASE_URL || config.address.dbms ||"127.0.0.1",
        user: config.postgres.databaseUser,
        database: config.postgres.databaseName
    }
}

config = {
    client: 'pg',
    version: '7.2',
    connection: dbConnection
};

module.exports = require('knex')(config);
