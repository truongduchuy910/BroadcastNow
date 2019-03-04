const modules = require('../modules/index')

module.exports = function(app) {
  
    app.post('/webhook/messenger', (webhook_event, res) => {  
      let body = webhook_event.body;
      if (body.object === 'page') {
        
        body.entry.forEach(entry => {                    
            modules.handle_webhook_event(entry);
        });
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    })  
    app.get('/webhook/messenger', (req, res) => {
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
}