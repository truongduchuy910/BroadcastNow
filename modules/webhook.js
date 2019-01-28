//Lưu ý: khi xuất trong console, mọi thao tác của người dùng được hiển thị bằng màu lam
var request = require('request')
const syntax = require('./syntax.js')
const db = require('./database.js')
var colors = require('colors');

function handle(sender_psid, webhook_event){
  if (webhook_event.message) {
    handleMessage(sender_psid, webhook_event.message);        
  } else if (webhook_event.postback) {
    handlePostback(sender_psid, webhook_event.postback);
  }
}
function handleMessage(sender_psid, received_message) {
    db.addUser(sender_psid);
    if (received_message.text) {    
      //syntax.parse will be callback to webhook
      syntax.parse(received_message.text, sender_psid);
    } 
  }
  
function handlePostback(sender_psid, received_postback) {
  let response;
      let payload = received_postback.payload;
    if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  callSendAPI(sender_psid, response);
}
//BROADCAST MESSAGES
//To Target Broadcast Messages, we need Creating a Label and Associating a Label to a PSID
//getLabelID when userID create Hashtag successful
//AssiciatingLabel when userID follow Hashtag
//SUPPORT FUNCTIONS
//Hàm chuyển JSON nhận được thành văn bản để trả về cho người dùng, khi dùng lệnh truy xuất cả thẻ đã đăng ký của PSID với FB
function history(PSID, action, status) {
  var history = PSID + ' > ' + action + ' | phản hồi: ' + status;
  console.log(history.blue);
}
//Những hàm dưới đây được gọi bởi module Syntax khi đã phân tích cú pháp
//------------------------------------------------------------------------------
// Trước khi thực hiện đăng ký Label Messenger với Facebook, không cần kiểm tra bởi vì nếu thẻ đã tồn tại thì Facebook sẽ báo lỗi
function creatHashtag (PSID, Hashtag) {
  var request_body = {    
    "name": Hashtag  
  };
  request({
    uri: "https://graph.facebook.com/v2.11/me/custom_labels",
    qs: { "access_token": process.env.PAGE_ACCESS_TOKEN },
    method: "POST",
    json: request_body
  }, (err, res, body) => {
    if (body.id) {
      var content = {
        name: Hashtag,
        ID: body.id,
        PSID: PSID
      }
      db.insertDocs("Messenger", "Hashtags", content);
      callSendAPI(PSID, 'Tạo thẻ #' + Hashtag + ' thành công');
      history(PSID, "tạo thẻ #" + Hashtag, "thành công");      
    } else {
      callSendAPI(PSID, 'Thẻ bạn tạo bị trùng trên hệ thống');
      history(PSID, "tạo thẻ #" + Hashtag, "thất bại, thẻ bị trùng");    
    }
  }); 
};
//------------------------------------------------------------------------------
//Kiểm tra sự tồn tại của Hashtags trước khi thực hiện việc đăng ký PSID với Label trên Facebook
function followHashtag(PSID, Hashtag) {
  db.findDocs("Messenger", "Hashtags", {name: Hashtag}, function(error, docs) {
    if (docs[0]) {
      LabelID = docs[0].ID;
      let request_body = {    
        user: PSID
      };
      request({
        uri: "https://graph.facebook.com/v2.11/" + LabelID + "/label",
        qs: { "access_token": process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body
      }, (err, res, body) => {
        if (!err) {
          callSendAPI(PSID, 'Đăng ký nhận thông báo từ #' + Hashtag + ' thành công');
          history(PSID, "đăng ký #" + Hashtag, "thành công");    
        } else {
          callSendAPI(PSID, 'Lỗi: ', err);
          history(PSID, "đăng ký #" + Hashtag, "thất bại, lỗi từ Mesenger Flatform");    
        }
      });
    } else {
      callSendAPI(PSID, 'Thẻ không tồn tại trên hệ thống');
      history(PSID, "đăng ký #" + Hashtag, "thất bại, thẻ đã tồn tại"); 
    }
  }); 
}
//------------------------------------------------------------------------------
//Không cần kiểm tra sự tồn tại của Hashtag, chỉ thực hiện yêu cầu unfollow. Nhưng vẫn tìm để lấy ID Hashtag và trả về lỗi cụ thể nếu muốn
function unfollowHashtag(PSID, Hashtag) {
  db.findDocs("Messenger", "Hashtags", {"name": Hashtag}, function(error, docs) {
    if (docs[0]) {
      LabelID = docs[0].ID;
      request({
        uri: "https://graph.facebook.com/v2.11/" + LabelID + "/label",
        qs: {
          user: PSID,
          access_token: process.env.PAGE_ACCESS_TOKEN
        },
        method: "DELETE"
      }, (err, res, body) => {
        if (!err) {
          callSendAPI(PSID, 'Hủy nhận thông báo từ #' + Hashtag + ' thành công');
          history(PSID, "hủy nhận #" + Hashtag, "thành công"); 
        } else {
          callSendAPI(PSID, 'Lỗi: ', err);
          history(PSID, "hủy nhận #" + Hashtag, "thất bại, lỗi từ Mesenger Flatform"); 
        }
      }); 
    } else {
      callSendAPI(PSID, 'Thẻ bạn hủy nhận thông báo không tồn tại trên hệ thống, vui lòng kiểm tra lại cú pháp');
      history(PSID, "hủy nhận #" + Hashtag, "thất bại, thẻ không tồn tại"); 
    }
  })
}
//------------------------------------------------------------------------------
//Khi lệnh gửi thành công, FB sẽ gửi về một đống JSON bùi nhùi nên phải phần tích để trả kết quả về
function myfollow(PSID) {
  request({
    uri: "https://graph.facebook.com/v2.11/" + PSID + "/custom_labels",
    qs: {
      fields: "name",
      access_token : process.env.PAGE_ACCESS_TOKEN
    },
    method: "GET"
  },(err, res, body) => {
      if (!err) {
        data = JSON.parse(body).data;
        var text = 'Các thẻ bạn đã đăng ký: ';
        data.forEach(element => {
          text += "\n#" + element.name;
        });
        callSendAPI(PSID, text);
        history(PSID, "xem thẻ đã đăng ký" , "thành công"); 
      } else {
        callSendAPI(PSID, 'Yêu cầu không thành công. Lỗi: ', err);
        history(PSID, "xem thẻ đã đăng ký", "thất bại, lỗi từ Mesenger Flatform"); 
      }
    }
  )
}
//------------------------------------------------------------------------------
//Lấy document chưa Hashtags và xem người dùng có quyền xóa thẻ này hay không
function deleteHashtag(PSID, Hashtag) {
  db.findDocs("Messenger", "Hashtags", {name: Hashtag}, function(error, docs) {
    if (docs[0]){
      if (docs[0].PSID == PSID) {
        request({
          uri: "https://graph.facebook.com/v2.11/" + docs[0].ID,
          qs: {"access_token": process.env.PAGE_ACCESS_TOKEN},
          method: "DELETE"
        }, (err, res, body) => {
          if (!err) {
            db.deleteDocs("Messenger", "Hashtags", {name: Hashtag});
            callSendAPI(PSID, 'Xóa thẻ #' + Hashtag + ' thành công');
            history(PSID, "Xóa thẻ #" + Hashtag, "thành công"); 
          } else {
            callSendAPI(PSID, 'Lỗi: ', err);
            history(PSID, "hủy nhận #" + Hashtag, "thất bại, lỗi từ Mesenger Flatform"); 
          }
        })
      } else {
        callSendAPI(PSID, 'Không thẻ xóa thẻ này, bạn chỉ được xóa những thẻ bạn đã tạo');
        history(PSID, "hủy nhận #" + Hashtag, "thất bại, người dùng không có quyền xóa thẻ"); 
      }
    } else {
      callSendAPI(PSID, 'Bạn đang yêu cầu xóa một thẻ không tồn tại trên hệ thống');
      history(PSID, "hủy nhận #" + Hashtag, "thất bại, thẻ không tồn tại"); 
    }
  });
}
//------------------------------------------------------------------------------
function mycreate(PSID) {
  db.findDocs("Messenger", "Hashtags", {PSID: PSID}, function(error,docs) {
    if (docs) {  
      var text = "các thẻ bạn đã tạo: ";
      docs.forEach( element => {
        text += "\n#" + element.name;
      });
      callSendAPI(PSID, text);
      history(PSID, "xem thẻ đã tạo", "thành công"); 
    } else {
      callSendAPI(PSID, 'Bạn chưa tạo thẻ nào cả');
      history(PSID, "xem thẻ đã tạo", "thất bại, không có thẻ nào được tạo"); 
    }
  });
}
//------------------------------------------------------------------------------
function help(PSID) {
  db.findDocs("Messenger", "Helps", {"type": "summary"}, function(error, docs) {
    if (docs) {
      callSendAPI(PSID, docs[0].content);
      history(PSID, "xem hướng dẫn", "thành công"); 
    } else {
      callSendAPI(PSID, "Lỗi");
      history(PSID, "xem hướng dẫn", " bất bại, lỗi khi lấy dữ liệu"); 
    }
  })
}
//------------------------------------------------------------------------------
//Trước khi gửi, kiểm tra xem PSID có quyền gửi hay không
function sendHashtag(PSID, Hashtag, Content) {
  db.findDocs("Messenger", "Hashtags", {"name":Hashtag}, function( error, docs) {
    if (docs && PSID == docs[0].PSID) {
      //Tạo một tin nhắn Broadcast để chuẩn bị gửi
      request({
        uri: "https://graph.facebook.com/v2.11/me/message_creatives",
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: "POST",
        json: {
          "messages": [
          {
            "dynamic_text": {
              "text": "[#" + hashtag + "]" + Content,
              "fallback_text": "OK"
            } 
          }
        ]
        }
      }, (err, res, body) => {
        if (!err) {
          var message_creative_id = body.message_creative_id;
          history(PSID, "Tạo tin nhắn để phát tán", "ID tin nhắn: " + message_creative_id); 
          callSendAPI(PSID, "Đang chuẩn bị để gửi");
          request({
            uri: "https://graph.facebook.com/v2.11/me/broadcast_messages",
            qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
            method: "POST",
            json: {    
              "message_creative_id": message_creative_id,
              "custom_label_id": docs[0].ID,
              "notification_type": "REGULAR",
              "messaging_type": "MESSAGE_TAG",
              "tag": "NON_PROMOTIONAL_SUBSCRIPTION"
            }
          }, (err, res, body) => {
            if (!err) {
              history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "thành công, ID sự kiện: " + body.broadcast_id); 
              callSendAPI(PSID, "Gửi thành công");
            } else {
              history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, Lỗi từ Messenger Flatform");
            }
          }); 
    
        } else {
          history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, Lỗi từ Messenger Flatform");  
        }
      }); 
    } else {
      if (PSID !== docs[0].PSID) {
        history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, không có quyền gửi thẻ");
        callSendAPI(PSID, "Bạn chỉ có thể gửi tới thẻ mình đã tạo");
      } else {
        history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, Lỗi từ Messenger Flatform");  
      };
    }
  })
}
//Support Functions
//------------------------------------------------------------------------------
function callSendAPI(sender_psid, response) {
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: {
      text: response
    }
  };
  // Send the HTTP request to the Messenger Platform
  request({
    uri: "https://graph.facebook.com/v2.6/me/messages",
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: "POST",
    json: request_body
  }, (err, res, body) => {
    if (!err) {
    } else {
    }
  }); 
  
}
module.exports.handle = handle;
module.exports.callSendAPI = callSendAPI;
module.exports.creatHashtag = creatHashtag;
module.exports.followHashtag = followHashtag;
module.exports.unfollowHashtag = unfollowHashtag;
module.exports.sendHashtag = sendHashtag;
module.exports.deleteHashtag = deleteHashtag;
module.exports.mycreate = mycreate;
module.exports.myfollow = myfollow;
module.exports.help = help;