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


module.exports = app;



