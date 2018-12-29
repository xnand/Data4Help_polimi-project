var express = require('express');
var config = require('../common/config.json');
var apiRouter = require('./routes/mob_api');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', apiRouter);

const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        swagger: '2.0',
        info: {
            title: 'Application Server Mobile Client',
            version: '1.0.0',
        },
		basePath: '/api',
    },
    apis: ['./ApplicationServerMobileClient/doc.yml'],
};
const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app; // used in tests

// server setup stuff ---------------------------------------------

/**
 * Module dependencies.
 */

var debug = require('debug')('trackmeserver:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || config.port.applicationServerMobileClient);
var ip = process.env.allIP || process.env.appServerMobileClientIP || config.address.applicationServerMobileClient || '127.0.0.1';
app.set('port', port, ip);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

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

/**
 * Event listener for HTTP server "error" event.
 */

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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    app.emit("appStarted");
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(`listening on http://${ip}:${port}`);
    if (swaggerSpec) {
        console.log(`documentation available on http://${ip}:${port}/docs`)
    }
}
