var express = require('express');
var config = require('../common/config.json');
var apiRouter = require('./routes/d4h_api');
var port = normalizePort(process.env.PORT_APPLICATIONSERVERDATA4HELP || config.port.applicationServerData4Help);
var ip = process.env.ADDRESS_APPLICATIONSERVERDATA4HELP || config.address.applicationServerData4Help;

var app = express();

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', apiRouter);

const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        swagger: '2.0',
        info: {
            title: 'Application Server Data4Help API documentation',
            description: 'REST endpoints for interacting with TrackMe’s company services',
            version: '1.0.0',
        },
        schemes: ['http'],
        host: `${ip}:${port}`,
        basePath: '/api',
    },
    apis: ['./ApplicationServerData4Help/doc.yml'],
};
const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;

// server setup stuff ---------------------------------------------
var http = require('http');
app.set('port', port, ip);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
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
    console.log(`ApplicationServerData4Help listening on http://${ip}:${port}`);
    if (swaggerSpec) {
        console.log(`documentation available on http://${ip}:${port}/docs`)
    }
}
