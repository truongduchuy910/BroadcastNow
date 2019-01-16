
const  express = require ('express');
const router = express.Router();
//router.get('/', (req, res) => {
//  if (req.query['hub.verify_token'] === process.env.WEBHOOK_TOKEN) {
//    res.send(req.query['hub.challenge']);
//  } else {
//    res.send('Error, wrong token');
//  }
//});
//router.post('/', (req, res) => {
//  res.sendStatus(200);
//
//  const data = req.body;
//  console.log('Webhook POST', JSON.stringify(data));
//  if (data.object === 'page') {
//    data.entry.forEach((pageEntry) => {
//      if (!pageEntry.messaging) {
//        return;
//      }
//      pageEntry.messaging.forEach((messagingEvent) => {
//        console.log({messagingEvent});
//
//        if (messagingEvent.message) {
//          receiveApi.handleReceiveMessage(messagingEvent);
//        }
//
//        if (messagingEvent.postback) {
//          receiveApi.handleReceivePostback(messagingEvent);
//        } else {
//          console.log(
//            'Webhook received unknown messagingEvent: ',
//            messagingEvent
//          );
//        }
//      });
//    });
//  }
//});
//
export default router;
