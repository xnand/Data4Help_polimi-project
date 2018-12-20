var express = require('express');
var knex = require('./knex');
var usersRouter = require('./routes/dbs_user');
var companyRouter = require('./routes/dbs_company');
var requestRouter = require('./routes/dbs_request');
var config = require('../common/config.json');

function createUserTable() {
    return knex.schema.createTable('user', function(table) {
        // columns
        table.string('ssn', 16).primary().notNullable();
        table.string('name', 32).notNullable();
        table.string('surname', 32).notNullable();
        table.enu('sex', ['male', 'female']).notNullable();
        table.date('birthDate').notNullable();
        table.string('country').notNullable();
        table.string('region').notNullable();
        table.string('city').notNullable();
        table.string('zipcode', 10).notNullable();
        table.string('street').notNullable();
        table.string('streetNr').notNullable();
        // constraints
        table.unique('ssn');
    });
}

function createCompanyTable() {
    return knex.schema.createTable('company', function(table) {
        // columns
        table.increments('id').notNullable();
        table.string('vat', 11).notNullable();
        table.string('name').notNullable();
        table.string('apiKey', 40).notNullable();
        // constraints
        table.unique('id');
        table.unique('vat');
        table.unique('apiKey');
    });
}

function createWearableDeviceTable() {
    return knex.schema.createTable('wearableDevice', function(table) {
        // columns
        table.string('macAddr', 17).notNullable();
        table.string('userSsn');
        // constraints
        table.unique('macAddr');
        table.unique(['macAddr', 'userSsn']);
        table.foreign('userSsn').references('ssn').inTable('user');
        table.primary(['macAddr', 'userSsn']);
    });
}

function createInfoPacketTable() {
    return knex.schema.createTable('infoPacket', function(table) {
        // columns
        table.timestamp('ts', true).notNullable(); // true = no timezone
        table.string('wearableMac');
        table.string('userSsn');
        table.float('geoX').notNullable();
        table.float('geoY').notNullable();
        table.float('heartBeatRate');
        table.float('bloodPressSyst'); // systolic pressure
        table.float('bloodPressDias'); // diastolic pressure
        // TODO body temp?
        // constraints
        table.foreign('wearableMac').references('macAddr').inTable('wearableDevice');
        table.foreign('userSsn').references('ssn').inTable('user');
        table.unique(['userSsn', 'wearableMac', 'ts']);
        table.primary(['userSsn', 'wearableMac', 'ts']);
    });
}

function createSpecificRequestTable() {
    return knex.schema.createTable('specificRequest', function(table) {
        // columns
        table.increments('id');
        table.integer('companyId').unsigned();
        table.enu('state', ['pending', 'authorized', 'rejected']);
        table.string('targetSsn');
        // constraints
        table.unique(['id', 'companyId']);
        table.foreign('targetSsn').references('ssn').inTable('user');
        table.foreign('companyId').references('id').inTable('company');
        table.dropPrimary(); // see this "feature" https://github.com/tgriesser/knex/issues/385
        table.primary(['id', 'companyId']);
    });
}

function createGroupRequestTable() {
    return knex.schema.createTable('groupRequest', function(table) {
        // columns
        table.increments('id');
        table.integer('companyId').unsigned();
        table.enu('state', ['pending', 'authorized', 'rejected']);
        // constraints
        table.unique('id');
        table.unique(['id', 'companyId']);
        table.foreign('companyId').references('id').inTable('company');
        table.dropPrimary(); // see this "feature" https://github.com/tgriesser/knex/issues/385
        table.primary(['id', 'companyId']);
    })
}

function createFilterTable() {
    return knex.schema.createTable('filter', function(table) {
        // columns
        table.increments('id');
        table.integer('requestId').unsigned(); // groupRequest only
        table.integer('companyId').unsigned();
        table.integer('ageStart');
        table.integer('ageEnd');
        table.string('country');
        table.string('region');
        table.string('city');
        table.string('zipcode', 10);
        table.string('street');
        table.string('streetNr');
        // TODO ?
        // constraints
        table.unique(['id', 'requestId', 'companyId']);
        table.foreign('requestId').references('id').inTable('groupRequest');
        table.foreign('companyId').references('id').inTable('company');
    })
}

function createUserCredentialsTable() {
    return knex.schema.createTable('userCredentials', function(table) {
        // columns
        table.string('ssn', 16).primary().notNullable();
        table.string('mail').notNullable();
        table.string('password', 32).notNullable();
        // constraints
        table.unique('ssn');
        table.foreign('ssn').references('ssn').inTable('user');
    });
}

function dropTables() {
    return new Promise(function(resolve, reject) {
        [
            'user',
            'userCredentials',
            'company',
            'wearableDevice',
            'infoPacket',
            'specificRequest',
            'groupRequest',
            'filter'
        ].reverse().reduce(function(prev, next) {
            return prev.then(function() {
                return knex.schema.dropTableIfExists(next);
            })
        }, Promise.resolve())
            .then(resolve)
            .catch(reject);
    })
}

function createTables() {
    createUserTable()
        .then(createUserCredentialsTable)
        .then(createCompanyTable)
        .then(createWearableDeviceTable)
        .then(createInfoPacketTable)
        .then(createSpecificRequestTable)
        .then(createGroupRequestTable)
        .then(createFilterTable)
        .catch(function(err) {
            console.log('error creating tables');
            console.log(err);
        })
}

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/user', usersRouter);
app.use('/company', companyRouter);
app.use('/request', requestRouter);

// remember to give this to postgres after the database has been created:
// ALTER DATABASE trackmedb SET datestyle TO "ISO, DMY";

// TODO if debug
app.get('/dropALL', function(req, res) {
    dropTables()
        .then(createTables)
        .then(res.status(200).send('ok'))
        .catch(function(err) {
            console.log(err);
            res.status(400).end();
        })
});


// server setup stuff ---------------------------------------------


debug = require('debug')('trackmeserver:server');
var http = require('http');

var port = normalizePort(process.env.PORT || config.port.databaseServer);
var ip = process.env.allIP || process.env.dbserverIP || config.address.databaseServer || '127.0.0.1';
app.set('port', port);

var server = http.createServer(app);

server.listen(port, ip);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(`listening on http://${ip}:${port}`);
}
