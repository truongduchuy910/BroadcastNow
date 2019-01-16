//nodemon --exec "heroku local" --signal SIGTERM
//heroku run rake db:migrate
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
//'use strict';
//const
//  express = require('express'),
//  bodyParser = require('body-parser'),
//  path = require('path'),
//  app = express().use(bodyParser.json()),
//  PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
//  VERIFY_TOKEN = process.env.VERIFY_TOKEN,
//  PORT = process.env.PORT || 5000;
//
//app.use(express.static(path.join(__dirname, 'public')))
//app.set('views', path.join(__dirname, 'views'))
//app.set('view engine', 'ejs')
//app.get('/', (req, res) => res.render('pages/index'))
//
//app.post('/webhook', (req, res) => {  
//  let body = req.body;
//  if (body.object === 'page') {
//    body.entry.forEach(function(entry) {
//      let webhook_event = entry.messaging[0];
//      console.log(webhook_event);
//      let sender_psid = webhook_event.sender.id;
//      console.log('Sender PSID: ' + sender_psid);
//      // Check if the event is a message or postback and`
//      // pass the event to the appropriate handler function
//      if (webhook_event.message) {
//        handleMessage(sender_psid, webhook_event.message);        
//      } else if (webhook_event.postback) {
//        handlePostback(sender_psid, webhook_event.postback);
//      }
//    });
//    res.status(200).send('EVENT_RECEIVED');
//  } else {
//    res.sendStatus(404);
//  }
//});
//app.get('/webhook', (req, res) => {
//  let mode = req.query['hub.mode'];
//  let token = req.query['hub.verify_token'];
//  let challenge = req.query['hub.challenge'];
//  if (mode && token) {
//    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//      console.log('WEBHOOK_VERIFIED');
//      res.status(200).send(challenge);
//    
//    } else {
//      res.sendStatus(403);      
//    }
//  }
//}); 
//function handleMessage(sender_psid, received_message) {
//
//  let response;
//
//  // Check if the message contains text
//  if (received_message.text) {    
//    // Create the payload for a basic text message
//    response = {
//      "text": `You sent the message: "${received_message.text}". Now send me an image!`
//    }
//  } else if (received_message.attachments) {
//  
//    // Gets the URL of the message attachment
//    let attachment_url = received_message.attachments[0].payload.url;
//    response = {
//      "attachment": {
//        "type": "template",
//        "payload": {
//          "template_type": "generic",
//          "elements": [{
//            "title": "Is this the right picture?",
//            "subtitle": "Tap a button to answer.",
//            "image_url": attachment_url,
//            "buttons": [
//              {
//                "type": "postback",
//                "title": "Yes!",
//                "payload": "yes",
//              },
//              {
//                "type": "postback",
//                "title": "No!",
//                "payload": "no",
//              }
//            ],
//          }]
//        }
//      }
//    }
//  } 
//  
//  
//  // Sends the response message
//  callSendAPI(sender_psid, response);  
//}
//function handlePostback(sender_psid, received_postback) {
//  let response;
//  
//  // Get the payload for the postback
//  let payload = received_postback.payload;
//
//  // Set the response based on the postback payload
//  if (payload === 'yes') {
//    response = { "text": "Thanks!" }
//  } else if (payload === 'no') {
//    response = { "text": "Oops, try sending another image." }
//  }
//  // Send the message to acknowledge the postback
//  callSendAPI(sender_psid, response);
//}
//function callSendAPI(sender_psid, response) {
//  // Construct the message body
//  let request_body = {
//    "recipient": {
//      "id": sender_psid
//    },
//    "message": response
//  }
//
//  // Send the HTTP request to the Messenger Platform
//  request({
//    "uri": "https://graph.facebook.com/v2.6/me/messages",
//    "qs": { "access_token": PAGE_ACCESS_TOKEN },
//    "method": "POST",
//    "json": request_body
//  }, (err, res, body) => {
//    if (!err) {
//      console.log('message sent!')
//    } else {
//      console.error("Unable to send message:" + err);
//    }
//  }); 
//}
//app.listen(PORT, () => console.log(`Listening on ${ PORT }`));