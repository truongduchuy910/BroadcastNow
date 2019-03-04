//../modules/index.js 
//nhận các yêu cầu của routers và gọi các modules ra để xử lý
const wit = require('./wit_API');
const db  = require("./mongodb_API");
const ms  = require("./messenger_API");
const ms_moles = require('../models/messenger');
var Label       = require('../models/label');

//MESSENGER ROUTER
function handle_webhook_event(entry){
  entry.messaging.forEach(element => {
    if (element.message) {
      handleMessage(element.sender.id, element.message);        
    } else if (element.postback) {
      handlePostback(element.sender.id, element.postback);
    }
  })
}
function messenger_command (PSID, command) {  
  if (command) { 
    wit.parse(command, function (error, docs) {
      var request = docs.entities.request[0].value;
      console.log(request);
      switch (request) {
        case "list_create": 
        db.get.list_create(PSID, function( error, docs) {
          // docs = [ 
          //   { _id: '5c4cac4cb780403d8c79f1b0',
          //   name: 'public.dut',
          //   ID: '1865545000216094',
          //   PSID: [ '1964519013637071', 'public.dut' ] 
          // },
          //   { _id: '5c68e0ad5213e1000438282e',
          //     name: 'ngochuy2k',
          //     ID: '1959661977496655',
          //     PSID: '1964519013637071' 
          //   } 
          // ]          

          ms.send(PSID, ms_moles.list_create(docs), function (error, docs) {
            console.log("docs: ", docs);                        
          });
        });
        break;
        case "list_follow": 
        ms.retrieve_PSID_label(PSID, function(error, docs) {
          // docs =  { data:
          //     [ { name: '18TCLCDT3', id: '2339017312798783' },
          //       { name: 'public.dut', id: '1865545000216094' } ],
          //    paging:
          //     { cursors:
          //        { before: '...',
          //          after: '..' } } }  
          ms.send(PSID, ms_moles.list_follow(docs.data), function (error, docs) {
            if (error) console.log("error: ", error);                        
          });        })  
        break;
      }
      

      var label = docs.entities.label[0].value;
      if (label) {
        switch (request) {
          case "add_hashtag":
          ms.create_label(PSID, label, function(error, docs) {
            if (docs.id) {
              ms.send(PSID, ms_moles.simple_message('Add label is sucessful!'), function(error, docs){
              });
              new_label = new Label();
              new_label.name = label;
              new_label.ID   = docs.id;
              new_label.PSID = [PSID];
              new_label.save(function(err) {
                
              })
            } else {
              ms.send(PSID,ms_moles.simple_message(docs.error.error_user_msg),
              function(err, docs) {
              });
            }
          })
          break;
          case "remove_hashtag":
          Label.findOne({name: label}, function(error, docs) {
            if (docs) {
              ms.remove_label( docs.ID, function(err, docs) {
                if (docs.success) {
                  Label.deleteOne({name: label}, function(error, docs) {})
                  ms.send(PSID, ms_moles.simple_message('remove successful!'), function(err, docs) {})
                }
                if (docs.error) ms.send(PSID, ms_moles.simple_message(docs.error.message), function(err, docs) {})
              })
            } else {
              ms.send(PSID, ms_moles.simple_message('label you want to remove is not exist'), function(err, docs) {
              })
            }
          })
          //db.set.remove_hashtag(PSID, label);
          break;
          case "follow_hashtag":
          console.log('follow_hashtag');
          //db.set.follow_hashtag(PSID, label);
          break;
          case "unfollow_hashtag":
          console.log('unfollow_hashtag');
          //db.set.unfollow_hashtag(PSID, label);
          break;          
          case "add_broadcast": 
          console.log('add_broadcast');
          //var broadcast = docs.entities.broadcast[0].value;
          //if (broadcast) db.set.add_broadcast(PSID, label, broadcast);
          break;
          case "verify":
          console.log('verify');
          //var verifyCode = docs.entities.verifyCode[0].value;
          //if (verifyCode) db.set.verify(PSID, verifyCode);
          break;
        }
      }
     //var hello = docs.entities.hello[0];
    });
  } 
}
//https://wit.ai/BroadcastNow/Loa_Loa/entities/request
function handleMessage(PSID, message) { 
  var text =  message.text;
  messenger_command(PSID, text);
}
function handlePostback(PSID, postback) {
    let payload = postback.payload;
  if (payload) {
    messenger_command(PSID, payload);
  }
}
module.exports.handle_webhook_event = handle_webhook_event;