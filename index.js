//nodemon --exec "heroku local" --signal SIGTERM
'use strict';
const logger = require('morgan');
const http = require('http');
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var session      = require('express-session');
const app = express();
const PORT = process.env.PORT || 5000
const server = http.createServer(app);mongoose.connect(process.env.uri, {useNewUrlParser: true});
require('./configs/passport')(passport); // 
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ secret: 'xxxxxxxxxxxxx' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 

require('./routers/messenge')(app);
require('./routers/pages')(app);
require('./routers/API')(app);
require('./routers/authentication')(app, passport);

app.listen(PORT, () => console.log(`Listening on ${ PORT } `))

