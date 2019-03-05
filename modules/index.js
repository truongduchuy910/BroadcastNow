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
      console.log(docs.entities);

      var request;
      console.log(docs.entities.request[0].confidence);
      if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77)  request = docs.entities.request[0].value;
      switch (request) {
        
        case "list_create": 
        Label.find({PSID: {$all:[PSID]}}, function( error, docs) {
          if (docs.length > 0) {
            ms.send(PSID, ms_moles.list_create(docs), function (error, docs) {
            });
          } else {
            ms.send(PSID, ms_moles.simple_message('Bạn chưa tạo thẻ nào'), function(err, docs) {
              ms.send(PSID, ms_moles.simple_message('Bạn có thể tạo thẻ như ví dụ dưới đây'), function(err, docs) {
                ms.send(PSID, ms_moles.simple_message('Tạo thẻ xinchaomoinguoi'), function(err, docs) {
                })
              });
            });
            
            
          }
        });
        break;
        case "list_follow": 
        ms.retrieve_PSID_label(PSID, function(error, docs) {
          console.log('retrieve_PSID_label');
          console.log(docs); 
          if (docs.data[0]) {
            ms.send(PSID, ms_moles.list_follow(docs.data), function (error, docs) {
                if (error) console.log("error: ", error);                        
            });        
            
          } else {
            ms.send(PSID, ms_moles.simple_message('Bạn chưa theo dõi thẻ nào cả.'), function(err, docs) {
            })
          }
        });  
        break;
      }
      
      var label;
      if (docs.entities.label) if (docs.entities.label[0].confidence > 0.7) label = docs.entities.label[0].value;
      console.log('label ',label);
      if (label) {
        switch (request) {
          case "add_hashtag":
          ms.create_label(PSID, label, function(error, docs) {
            if (docs.id) {
              ms.send(PSID, ms_moles.simple_message('Tạo thẻ ' + label + ' thành công.'), function(error, docs){
              });
              new_label = new Label();
              new_label.name = label;
              new_label.ID   = docs.id;
              new_label.PSID = [PSID];
              new_label.save(function(err) {
                
              })
            } else {
              ms.send(PSID,ms_moles.simple_message('thẻ này đã tồn tại, vui lòng chọn thẻ khác.'),
              function(err, docs) {
              });
            }
          })
          break;
          case "remove_hashtag":
          Label.findOne({name: label}, function(error, docs) {
            if (docs) {
              if (in_array(PSID, docs.PSID)) {
                ms.remove_label( docs.ID, function(err, docs) {
                  if (docs.success) {
                    Label.deleteOne({name: label}, function(error, docs) {})
                    ms.send(PSID, ms_moles.simple_message('Xóa thẻ '+label+' thành công.'), function(err, docs) {})
                  }
                  if (docs.error) ms.send(PSID, ms_moles.simple_message(docs.error.message), function(err, docs) {})
                })
              }
            } else {
              ms.send(PSID, ms_moles.simple_message('Thẻ ' +label+' không tồn tại'), function(err, docs) {
              })
            }
          })
          break;
          case "follow_hashtag":
          Label.findOne({name: label}, function(error, docs) {
            if (docs) {
              ms.associate_label(PSID, docs.ID, function(err,docs) {
                if (docs.success) {
                  ms.send(PSID, ms_moles.simple_message('theo dõi thẻ '+label+' thành công'), function(err, docs){
                  })
                } else {
                  ms.send(PSID, ms_moles.simple_message('theo dõi thẻ '+label+' không thành công'), function(err, docs){
                })
                }
              })
            }
          })
          break;
          case "unfollow_hashtag":
          console.log('unfollow_hashtag');
          Label.findOne({name: label}, function(error, docs) {
            if (docs) {
              ms.unassociate_label(PSID, docs.ID, function(err,docs) {
                if (docs.success) {
                  ms.send(PSID, ms_moles.simple_message('bỏ theo dõi '+label+' thẻ thành công'), function(err, docs){
                  })
                } else {
                  ms.send(PSID, ms_moles.simple_message('bỏ theo dõi thẻ '+label+' không thành công'), function(err, docs){
                })
                }
              })
            }
          })          
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
function in_array(a, b) {
  var bool = false;
  b.forEach(element => {
    if (a === element) bool = true;
  })
  return bool;
}