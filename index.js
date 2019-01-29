//nodemon --exec "heroku local" --signal SIGTERM
'use strict';
const logger = require('morgan');
const http = require('http');
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const webhook = require('./modules/webhook.js')
const public_dut = require('./modules/public_dut.js');
const app = express();
const PORT = process.env.PORT || 5000
const server = http.createServer(app);


app
  .use(logger('dev'))
  .use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/webhook', (req, res) => {  
    let body = req.body;
    if (body.object === 'page') {
      body.entry.forEach(function(entry) {
        var webhookEvent = entry.messaging[0];
        webhook.handle(webhookEvent.sender.id, webhookEvent);
      });
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  })  
  .get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        res.sendStatus(403);      
      }
    }
  })
  .get('/public_dut', async (req,res) => {
    var content = await public_dut.getNotifications();
    res.send("OK");
  })
  .get('/getData', async(req,res) => {
    await res.send('OK');
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT } `))

