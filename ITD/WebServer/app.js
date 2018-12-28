var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cons = require('consolidate');

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// View engine setup
app.engine('html', cons.swig);
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// swagger documentation
const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        swagger: '2.0',
        info: {
            title: 'Application Server Data4Help',
            version: '1.0.0',
        },
    },
    apis: ['./D4Hdoc.yml'],
};
const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => {
    res.render('register');
});

app.post('/send', (req, res) => {
    const output = `
    <p>New registration request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Business Name: ${req.body.businessName}</li>
      <li>Vat: ${req.body.vat}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'wtrackme@gmail.com',
            pass: 'Data4.Help'
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Web Server TrackMe" <wtrackme@gmail.com>', // sender address
        to: 'wtrackme@gmail.com', // list of receivers
        subject: 'Data4Help Registration', // Subject line
        text: 'Tell us why you want to use our service.', // plain text body
        html: output // html body
    };

    //validation email field
    var a= new String(req.body.email);

    if(!req.body.businessName==""&&!req.body.vat==""&&(a.indexOf("@")!=-1&&(a.indexOf(".")!=-1)&&(a.lastIndexOf("@"))<a.lastIndexOf("."))){
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            res.render('register');

        });
    }
    else{
        console.log('Message not sent');
        res.render('register');
    }

});

// server setup stuff ---------------------------------------------
var debug = require('debug')('trackmeserver:server');
var http = require('http');

var port = normalizePort(process.env.PORT || 3000); // todo change port and maybe put some config file
var ip = process.env.allIP || process.env.appServerD4HIP || '127.0.0.1';
app.set('port', port, ip);

var server = http.createServer(app);
server.listen(port);
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
    if (swaggerSpec) {
        console.log(`documentation available on http://${ip}:${port}/documentation`)
    }
}


module.exports = app;



