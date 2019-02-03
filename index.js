//nodemon --exec "heroku local" --signal SIGTERM
'use strict';
const logger = require('morgan');
const http = require('http');
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 5000
const server = http.createServer(app);


app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
require('./routes/functions')(app);
require('./routes/messenger')(app);
require('./routes/pages')(app);
app.listen(PORT, () => console.log(`Listening on ${ PORT } `))

