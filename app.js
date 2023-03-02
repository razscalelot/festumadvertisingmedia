const dotenv = require('dotenv').config();
const cors = require('cors');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
let mongoose = require('mongoose');
var expressLayouts = require('express-ejs-layouts');
var indexRouter = require('./routes/index');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

mongoose.set('runValidators', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
  console.log("Well done!, connected with MongoDB Database");
}).on('error', error => {
  console.log("Oops! database connection error:" + error);
});

app.use('/', indexRouter);

const organizerpaths = [
  { pathUrl: '/', routeFile: 'index' },
  { pathUrl: '/login', routeFile: 'login' },
  { pathUrl: '/register', routeFile: 'register' },
  { pathUrl: '/profile', routeFile: 'profile' }
];


const developerpaths = [
  { pathUrl: '/', routeFile: 'index' },
  { pathUrl: '/login', routeFile: 'login' },
  { pathUrl: '/register', routeFile: 'register' },
  { pathUrl: '/profile', routeFile: 'profile' }
];

const agentpaths = [
  { pathUrl: '/', routeFile: 'index' },
  { pathUrl: '/login', routeFile: 'login' },
  { pathUrl: '/register', routeFile: 'register' },
  { pathUrl: '/profile', routeFile: 'profile' }
];

organizerpaths.forEach((path) => {
  app.use('/organizer' + path.pathUrl, require('./routes/organizers/' + path.routeFile));
});

developerpaths.forEach((path) => {
  app.use('/developer' + path.pathUrl, require('./routes/developers/' + path.routeFile));
});

agentpaths.forEach((path) => {
  app.use('/agent' + path.pathUrl, require('./routes/agents/' + path.routeFile));
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
