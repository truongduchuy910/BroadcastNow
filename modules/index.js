const Wit        = require('./API/wit');
const Ms         = require('./API/messenge');   

const Ms_models  = require('../models/messenger');
var Label        = require('../models/label');
var PSIDs        = require('../models/PSID');

var Request      = require('./request');

//MESSENGER ROUTER

function handle_webhook_event(entry){
  add_user(entry.messaging[0].sender.id);    
    if (entry.messaging[0].postback) {
      handlePostback(entry.messaging[0]/*.sender.id, entry.messaging[0].postback*/);
    } else if (entry.messaging[0].message) {
      handleMessage(entry.messaging[0]/*.sender.id, entry.messaging[0].message*/);        
    } 
}
//https://wit.ai/BroadcastNow/Loa_Loa/entities/request
function handleMessage(messaging) { 
  var command;

  var PSID;
  if (messaging.sender.id) PSID = messaging.sender.id;



  if (messaging.message.quick_reply) {
    if (messaging.message.quick_reply.payload) command = messaging.message.quick_reply.payload;
    Wit.parse(command, function (error, docs) {
      var request;
      if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77)  request = docs.entities.request[0].value;
      
      var label;
      if (docs.entities.label) if (docs.entities.label[0].confidence > 0.55) label = docs.entities.label[0].value;
    
      switch (request) {
        case "add_attach"    : Request.add_attach(PSID, label, function(err,docs) {
        }); break;
        case "remove_attach" : Request.remove_attach(PSID, function(err, docs) {
        }); break;
      }
    })
  }


  if (messaging.message.attachments) {
    PSIDs.findOne({PSID: PSID}, function(err, docs) {
      if (docs.previous_label) {
        ms.broadcast(
          PSID, 
          docs.previous_label, 
          ms_models.attachments_broadcast(docs.previous_label, messaging.message.attachments),
          function(err,docss){
            ms.send(
              PSID, 
              ms_models.quick_replies('✅ Gửi thành công!\n📎 Bạn muốn đính kèm tệp?', [
                {
                  content_type: "text",
                  title: "Gửi tiếp tệp",
                  payload: "add_attach "+docs.previous_label
                },
                {
                  content_type: "text",
                  title: "Không, cảm ơn",
                  payload: "remove_attach "+docs.previous_label
                }
              ]), function(err, docs) {    
              } 
           );
          }
        );
      }
    });
  }
  
  if (messaging.message.text) {
    Wit.parse(command, function(err, docs){

    })
  }
}
function handlePostback(messaging) {
  if (messaging.postback.payload) {
  }
}
module.exports.handle_webhook_event = handle_webhook_event;
function in_array(a, b) {
  var bool = false;
  b.forEach(element => {
    if (a === element) bool = true;
  })
  return bool;
}
function add_user(PSID) {
  PSIDs.findOne({PSID: PSID}, function(err, docs){
    if (!docs) {
      ms.retrieve_profile(PSID, function(err,docs){
        var new_PSID = new PSIDs();
        new_PSID.PSID        = PSID;
        new_PSID.first_name  = docs.first_name;
        new_PSID.last_name   = docs.last_name;
        new_PSID.profile_pic = docs.profile_pic;
        new_PSID.save(function(err) {  
        });
        ms.send(PSID, ms_models.quick_replies('Xin chào, '+docs.first_name+' '+docs.last_name, [
          {
            content_type:"text",
            title:"theo dõi public.dut",
            payload:"theo dõi public.dut"
          }
        ]), function(err, docs){
          
        })
      })
      
    }
  });
}
function send_sticker(PSID, status) {

}
function random_item_in(array) {
  return array[ Math.floor(Math.random() * array.length) ];
}






//----------------------------------------------------------------------------------------------------------------------------------
function entity_parse(docs){
  var request;
  var label  ;
  var number ;
  var CODE   ;
  var content;
  if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77 ) request = docs.entities.request[0].value;
  if (docs.entities.label)   if (docs.entities.label[0].confidence   > 0.55 ) label   = docs.entities.label[0].value;  
  if (docs.entities.number)  if (docs.entities.number[0].confidence  > 0.55 ) number  = docs.entities.number[0].value;
  if (docs.entities.CODE)    if (docs.entities.CODE[0].confidence    > 0.40 ) CODE    = docs.entities.CODE[0].value;
  if (docs.entities.content) if (docs.entities.content[0].confidence > 0.40 ) content = docs.entities.content[0].value;
  return {
    request: request,
    label  : label  ,
    number : number ,
    CODE   : CODE   ,
    content: content
  }
}
//----------------------------------------------------------------------------------------------------------------------------------
function command(command){
  wit.parse(command, function (error, docs) {
    //Get Entity
    var entities = entity_parse(docs);
    switch (request) {
      case "list_create"      : list_create     (PSID, entities.number);break;
      case "list_follow"      : list_follow     (PSID, entities.number);break;
      case "add_hashtag"      : add_hashtag     (PSID, entities.label);break;
      case "remove_hashtag"   : remove_hashtag  (PSID, entities.label);break;
      case "follow_hashtag"   : follow_hashtag  (PSID, entities.label);break;
      case "unfollow_hashtag" : unfollow_hashtag(PSID, entities.label);break;
      case "add_broadcast"    : add_broadcast   (PSID, entities.label, entities.content);break; 
    }
});

}