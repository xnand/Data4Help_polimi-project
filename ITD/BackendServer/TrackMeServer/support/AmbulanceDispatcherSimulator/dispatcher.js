var express = require('express');
var config = require('../../common/config.json');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
	res.status(200).send('i\'m online\n');
});

app.post('/dispatchAmbulance', function(req, res) {
	if (!req.body.location.x || !req.body.location.y) {
		res.status(400).end();
	}
	// do some stuff with provided data ...
	res.status(201).send({eta: randomInt(3, 30)});
});

// simulate estimated time to arrival
function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low)
}


// set up server
var http = require('http');
var port = normalizePort(process.env.PORT_AMBULANCEDISPATCHERSIM || config.port.ambulanceDispatcherSim);
var ip = process.env.ADDRESS_AMBULANCEDISPATCHERSIM|| config.address.ambulanceDispatcherSim;
app.set('port', port);
var server = http.createServer(app);
server.listen(port, ip);
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
	console.log(`Ambulance dispatcher simulator listening on http://${ip}:${port}`);
}
