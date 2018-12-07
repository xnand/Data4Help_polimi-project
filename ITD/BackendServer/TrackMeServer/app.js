var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var knex = require('./DatabaseServer/knex');

function createUserTable() {
    return knex.schema.createTable('user', function(table) {
        // columns
        table.string('ssn', 16).primary().notNullable();
        table.string('name', 32).notNullable();
        table.string('surname', 32).notNullable();
        table.enu('sex', ['male', 'female']).notNullable();
        table.date('birthDate').notNullable();
        table.string('state').notNullable();
        table.string('country').notNullable();
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
        table.increments('id').primary().notNullable();
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
        table.timestamp('ts').defaultTo(knex.fn.now()).notNullable();
        table.string('wearableMac');
        table.string('userSsn');
        table.float('geoX').notNullable();
        table.float('geoY').notNullable();
        table.float('hearBeatRate').notNullable();
        table.float('bloodPressSyst').notNullable(); // systolic pressure
        table.float('bloodPressDias').notNullable(); // diastolic pressure
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
        table.integer('id').autoIncrement;
        table.integer('companyID');
        table.enu('state', ['pending', 'authorized', 'rejected']);
        table.string('targetSsn');
        // constraints
        table.unique(['id', 'companyID']);
        table.foreign('targetSsn').references('ssn').inTable('user');
        table.foreign('companyID').references('id').inTable('company');
        table.primary(['id', 'companyID']);
    });
}

function createGroupRequestTable() {
    return knex.schema.createTable('groupRequest', function(table) {
        // columns
        table.integer('id').autoIncrement;
        table.integer('companyID');
        table.enu('state', ['pending', 'authorized', 'rejected']);
        // constraints
        table.unique('id');
        table.unique(['id', 'companyID']);
        table.foreign('companyID').references('id').inTable('company');
        table.primary(['id', 'companyID']);
    })
}

function createFilterTable() {
    return knex.schema.createTable('filter', function(table) {
        // columns
        table.integer('id').autoIncrement;
        table.integer('requestID');
        table.integer('companyID');
        table.integer('ageStart');
        table.integer('ageEnd');
        table.string('state');
        table.string('country');
        table.string('city');
        table.string('zipcode', 10);
        table.string('street');
        table.string('streetNr');
        // TODO disease
        // TODO
        // constraints
        table.unique(['id', 'requestID', 'companyID']);
        table.foreign('requestID').references('id').inTable('groupRequest');
        table.foreign('companyID').references('id').inTable('company');
    })
}

function dropTables() {
    return new Promise(function(res) {
        [
            'user',
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
            .then(res);
    })
}

function createTables(drop) {
    new Promise(function(res) {
        if (drop) {
            dropTables()
                .then(res)
        }
        else {
            res();
        }
    })
    .then(createUserTable)
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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);

// TODO if debug env
app.get('/dropALL', function(req, res) {
    dropTables()
        .then(createTables)
        .then(res.status(200).send('ok'));
});

// createTables(true);

module.exports = app;
