//../modules/index.js 
//nhận các yêu cầu của routers và gọi các modules ra để xử lý
const wit       = require('./wit_API');
const ms        = require("./messenger_API");
const ms_models  = require('../models/messenger');
var Label       = require('../models/label');
var PSIDs        = require('../models/PSID');

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
  if (messaging.message) {
    var command = messaging.message.text;
    var PSID    = messaging.sender.id;
    if (messaging.message.quick_reply) {
      var command = messaging.message.quick_reply.payload;
      console.log(command);
      wit.parse(command, function (error, docs) {
        var request;
        if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77)  request = docs.entities.request[0].value;
        console.log('request: ', request);
        var label;
        if (docs.entities.label) if (docs.entities.label[0].confidence > 0.55) label = docs.entities.label[0].value;
        console.log('label: ', label);
        switch (request) {
          case "add_attach"    : add_attach(PSID, label); break;
          case "remove_attach" : remove_attach(PSID); break;
        }
      })

       

    } if (messaging.message.attachments){
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
    } else  if (command) wit.parse(command, function (error, docs) {
      //Get Entity
      var request;
      if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77)  request = docs.entities.request[0].value;
      console.log('request: ', request);
      
      var label;
      if (docs.entities.label) if (docs.entities.label[0].confidence > 0.55) label = docs.entities.label[0].value;
      console.log('label: ', label);
      if (label) if (label.indexOf(' ') == -11) {
        ms.send(PSID, ms_models.simple_message('⚠ Không thẻ thao tác với thẻ <'+label+'>. Tên thẻ không được có khoảng trắng.'), function(err, docs) {
        });
      }
      
      var number;
      if (docs.entities.number) if (docs.entities.number[0].confidence > 0.55) number = docs.entities.number[0].value;
      console.log('number: ', number);
      
      var CODE;
      if (docs.entities.CODE) if (docs.entities.CODE[0].confidence > 0.4) CODE = docs.entities.CODE[0].value;
      console.log('CODE: ', CODE);
      
      var content;
      if (docs.entities.content) if (docs.entities.content[0].confidence > 0.4) content = docs.entities.content[0].value;
      console.log('content: ', content);

      switch (request) {
        case "list_create"      : list_create(PSID, number);break;
        case "list_follow"      : list_follow(PSID, number);break;
        case "add_hashtag"      : add_hashtag(PSID, label);break;
        case "remove_hashtag"   : remove_hashtag(PSID, label);break;
        case "follow_hashtag"   : follow_hashtag(PSID, label);break;
        case "unfollow_hashtag" : unfollow_hashtag(PSID, label);break;
        case "add_broadcast"    : add_broadcast(PSID, label, content);break; 
      }
    });
  }
  if (messaging.message.attachments) {
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





function list_create(PSID, number) {
  Label.find({PSID: {$all:[PSID]}}, function( error, docs) {
    if (docs.length > 0) {
      ms.send(PSID, ms_models.list_create(docs, number), function (error, docs) {
        ms.send(PSID, ms_models.simple_message('Bạn có thể xóa thẻ như ví dụ dưới đây'), function(err, docs) {
          ms.send(PSID, ms_models.simple_message('Xóa thẻ xin_chào'), function(err, docs) {
          })
        });
      });
    } else {
      ms.send(PSID, ms_models.simple_message('⚠ Bạn chưa tạo thẻ nào'), function(err, docs) {
      });            
    }
  });
}
function list_follow(PSID, number) {
  ms.retrieve_PSID_label(PSID, function(error, docs) {
    if (docs.data[0]) {
      ms.send(PSID, ms_models.list_follow(docs.data, number), function (error, docs) {
      });        
    } else {
      ms.send(PSID, ms_models.quick_replies('⚠ Bạn chưa theo dõi thẻ nào cả.', [
        {
          content_type: "text",
          title: "theo dõi public.dut",
          payload: "follow_hashtag public.dut"
        }
      ]), function(err, docs) {
      })
    }
  }); 
}
function add_hashtag(PSID, label) {
  if (label) {
    ms.create_label(PSID, label, function(error, docs) {
      if (docs.id) {
        ms.send(PSID, ms_models.quick_replies('✅ Tạo thẻ ' + label + ' thành công.',[
          {
            content_type: "text",
            title: "Danh sách đã tạo",
            payload: "list_create"
          }
        ]), function(error, docs){
        });
        new_label = new Label();
        new_label.name = label;
        new_label.ID   = docs.id;
        new_label.PSID = [PSID];
        new_label.save(function(err) {
          
        })
      } else {
        ms.send(PSID,ms_models.simple_message('⚠ thẻ này đã tồn tại, vui lòng chọn thẻ khác.'),
        function(err, docs) {
        });
      }
    })
  }
}
function remove_hashtag(PSID, label) {
  if (label) {
    Label.findOne({name: label}, function(error, docs) {
      if (docs) {
        if (in_array(PSID, docs.PSID)) {
          ms.remove_label( docs.ID, function(err, docs) {
            if (docs.success) {
              Label.deleteOne({name: label}, function(error, docs) {})
              ms.send(PSID, ms_models.quick_replies('✅ Xóa thẻ '+label+' thành công.',[
                {
                  content_type: "text",
                  title: "Danh sách đã tạo",
                  payload: "list_create"

                }
              ]), function(err, docs) {})
            } else if (docs.error) {
              ms.send(PSID, ms_models.simple_message(docs.error.message), function(err, docs) {});
            }
          })
        } else {
          ms.send(PSID, ms_models.simple_message('⚠ Bạn không có quyền xóa thẻ ' +label), function(err, docs) {
          })
        }
      } else {
        ms.send(PSID, ms_models.simple_message('⚠ Thẻ ' +label+' không tồn tại'), function(err, docs) {
        })
      }
    })
  }
}
function follow_hashtag(PSID, label) {
  Label.findOne({name: label}, function(error, docs) {
    if (docs) {
      ms.associate_label(PSID, docs.ID, function(err,docs) {
        if (docs.success) {
          ms.send(PSID, ms_models.quick_replies('✅ Theo dõi thẻ '+label+' thành công',[
            {
              content_type: "text",
              title: "Thẻ đã theo dõi",
              payload: "list_follow"
            }
          ]), function(err, docs){
          })
        } else {
          ms.send(PSID, ms_models.simple_message('⚠ Theo dõi thẻ '+label+' không thành công'), function(err, docs){
        })
        }
      })
    }else {
      ms.send(PSID, ms_models.simple_message('⚠ Thẻ ' +label+' không tồn tại'), function(err, docs) {
      })
    }
  })
}
function unfollow_hashtag(PSID, label) {
  Label.findOne({name: label}, function(error, docs) {
    if (docs) {
      ms.unassociate_label(PSID, docs.ID, function(err,docs) {
        if (docs.success) {
          ms.send(PSID, ms_models.quick_replies('✅ Bỏ theo dõi '+label+' thẻ thành công',[
            {
              content_type: "text",
              title: "Thẻ đã theo dõi",
              payload: "list_follow"

            }
          ]), function(err, docs){
          })
        } else {
          ms.send(PSID, ms_models.simple_message('⚠ Bỏ theo dõi thẻ '+label+' không thành công'), function(err, docs){
        })
        }
      })
    } else {
      ms.send(PSID, ms_models.simple_message('⚠ Thẻ ' +label+' không tồn tại'), function(err, docs) {
      })
    }
  })    
}
function add_broadcast(PSID, label, content) {
  if (content) ms.broadcast(PSID, label, ms_models.simple_broadcast(label, content), function(error, docs) {
    if (docs.broadcast_id) {
      ms.send(
        PSID, 
        ms_models.quick_replies('✅ Gửi thành công!\n📎 Bạn muốn đính kèm tệp?', [
          {
            content_type: "text",
            title: "Gửi tiếp tệp",
            payload: "add_attach "+label
          },
          {
            content_type: "text",
            title: "Không, cảm ơn",
            payload: "remove_attach "+label
          }
        ]), function(err, docs) {    
        } 
     );
    }
  });
}
function add_attach(PSID, label) {
  PSIDs.findOneAndUpdate({PSID:PSID}, {previous_label: label}, function(err, docs) {
    ms.send(PSID, ms_models.simple_message('Hệ thống đang đợi, bạn hãy gửi tiếp cho chúng tôi một bộ ảnh, tệp,... hoặc âm thanh muốn đính kèm!'), function(err,docs){
    });
  });
  
}
function remove_attach(PSID) {
  PSIDs.findOneAndUpdate({PSID:PSID}, {previous_label: null}, function(err, docs) {
    ms.send(PSID, ms_models.simple_message('😁'), function(err,docs){
    });});
}