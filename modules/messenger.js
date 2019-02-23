//Lưu ý: khi xuất trong console, mọi thao tác của người dùng được hiển thị bằng màu lam
var request = require('request')
const syntax = require('./syntax.js')
const db = require('./database.js')
var colors = require('colors');
var User            = require('../models/users');

function handle(sender_psid, webhook_event){
  if (webhook_event.message) {
    handleMessage(sender_psid, webhook_event.message);        
  } else if (webhook_event.postback) {
    handlePostback(sender_psid, webhook_event.postback);
  }
}
function handleMessage(sender_psid, received_message) {
  db.findDocs('Messenger', 'PSIDs', {PSID: sender_psid}, function(error, docs) {
    if (docs[0]) {
    } else {
      request({
        uri: "https://graph.facebook.com/" + sender_psid,
        qs: { 
          access_token: process.env.PAGE_ACCESS_TOKEN,
          fields: 'first_name,last_name,profile_pic'
        },
        method: "GET",
      }, (err, res, body) => {    
        var data = JSON.parse(body);
        if (data.first_name) {          
          var userID = {
            PSID: sender_psid,
            first_name: data.first_name,
            last_name: data.last_name,
            profile_pic: data.profile_pic
          }
          db.insertDocs('Messenger', 'PSIDs', userID);
          console.log('Thêm người dùng: ', sender_psid);
        } else {
          console.log('không bắt được dữ liệu từ PSID trong hàm handleMessage');
          console.log('err: ', err);
          console.log('body: ', body);
        }
      }); 
    }
  })
    if (received_message.text) {    
      //syntax.parse will be callback to webhook
      syntax.parse(received_message.text, sender_psid);
    } 
  }
  
function handlePostback(sender_psid, received_postback) {
  let response;
  let payload = received_postback.payload;
  switch (payload) {
    case 'SIGNUP':
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Đăng Ký",
          "buttons":[
            {
              "type": "account_link",
              "url": "http://www.broadcastnow.club/signup/facebook"
            }
          ]
        }
      }
    }
    break;
    case 'LOGIN':
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Đăng Nhập để sử dụng trên Website",
          "buttons":[
            {
              "type": "web_url",
              "url": "http://www.broadcastnow.club/login",
              "title": "Đăng Nhập",
            }
          ]
        }
      }
    }
    break;
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
function createHashtag (PSID, Hashtag) {
  var request_body = {    
    "name": Hashtag  
  };
  request({
    uri: "https://graph.facebook.com/v2.11/me/custom_labels",
    qs: { "access_token": process.env.PAGE_ACCESS_TOKEN },
    method: "POST",
    json: request_body
  }, (err, res, data) => {
    if (!data.error) { 
      var content = {
        name: Hashtag,
        ID: data.id,
        PSID: [PSID]
      }
      db.insertDocs("Messenger", "Hashtags", content);
      callSendAPI(PSID, 'Tạo thẻ #' + Hashtag + ' thành công');
      history(PSID, "tạo thẻ #" + Hashtag, "thành công");      
    } else {
      callSendAPI(PSID, 'Thẻ bạn tạo bị trùng trên hệ thống');
      history(PSID, "tạo thẻ #" + Hashtag, "Thẻ bị trùng", "Thất bại");   
      if (err) {
        console.log('không khởi tạo thẻ được trong createHashtag');
        console.log('err: ', err);
        console.log('body: ', body);
      }
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
      }, (err, res, data) => {
        if (!data.error) {          
          callSendAPI(PSID, 'Đăng ký nhận thông báo từ #' + Hashtag + ' thành công');
          history(PSID, "đăng ký #" + Hashtag, "thành công");    
        } else {
          callSendAPI(PSID, 'Lỗi: ', err);
          history(PSID, "đăng ký #" + Hashtag, "Lỗi tại followHashtag", "Thất bại");   
          if (err) {
            console.log('Không thẻ đăng ký thẻ tại followHashtag');
            console.log('err: ', err);
            console.log('body: ', body);
          } 
        }
      });
    } else {
      callSendAPI(PSID, 'Thẻ không tồn tại trên hệ thống');
      history(PSID, "đăng ký #" + Hashtag, "Thẻ đã tồn tại", "Thất bại"); 
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
        var data = JSON.parse(body);
        if (!data.error) {
          callSendAPI(PSID, 'Hủy nhận thông báo từ #' + Hashtag + ' thành công');
          history(PSID, "hủy nhận #" + Hashtag, "thành công"); 
        } else {
          callSendAPI(PSID, 'Lỗi: ', err);
          history(PSID, "hủy nhận #" + Hashtag, "Lỗi tại unfollow", "Thất bại"); 
          if (err) {
            console.log('Không thẻ hủy đăng ký thẻ tại unfollowHashtag');
            console.log('err: ', err);
            console.log('body: ', body);
          } 
        }
      }); 
    } else {
      callSendAPI(PSID, 'Thẻ bạn hủy nhận thông báo không tồn tại trên hệ thống, vui lòng kiểm tra lại cú pháp');
      history(PSID, "hủy nhận #" + Hashtag, "Thẻ không tồn tại", "Thất bại"); 
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
    var data = JSON.parse(body);
    if (!data.error) {
        var text = 'Các thẻ bạn đã đăng ký: ';
        data.data.forEach(element => {
          text += "\n#" + element.name;
        });
        callSendAPI(PSID, text);
        history(PSID, "xem thẻ đã đăng ký" , "thành công"); 
      } else {
        callSendAPI(PSID, 'Yêu cầu không thành công. Lỗi: ', err);
        history(PSID, "xem thẻ đã đăng ký", "thất bại, tại myfollow"); 
        if (err) {
          console.log('lỗi tại myfollow');
          console.log('err: ', err);
          console.log('body: ', body);
        } 
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
          var data = JSON.parse(body);
          if (data) {
            db.deleteDocs("Messenger", "Hashtags", {name: Hashtag});
            callSendAPI(PSID, 'Xóa thẻ #' + Hashtag + ' thành công');
            history(PSID, "Xóa thẻ #" + Hashtag, "thành công"); 
          } else {
            callSendAPI(PSID, 'Lỗi: ', err);
            history(PSID, "xóa thẻ #" + Hashtag, "Lỗi tại deleteHashtag", "Thất bại"); 
            if (err) {
              console.log('lỗi tại deleteHashtag');
              console.log('err: ', err);
              console.log('body: ', body);
            } 
          }
        })
      } else {
        callSendAPI(PSID, 'Không thẻ xóa thẻ này, bạn chỉ được xóa những thẻ bạn đã tạo');
        history(PSID, "xóa thẻ #" + Hashtag, "Người dùng không có quyền xóa thẻ", "Thất bại"); 
      }
    } else {
      callSendAPI(PSID, 'Bạn đang yêu cầu xóa một thẻ không tồn tại trên hệ thống');
      history(PSID, "hủy nhận #" + Hashtag, "Thẻ không tồn tại", "Thất bại"); 
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
      history(PSID, "xem thẻ đã tạo", "Không có thẻ nào được tạo", "Thành công"); 
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
      history(PSID, "xem hướng dẫn", " Lỗi khi lấy dữ liệu"); 
    }
  })
}
//------------------------------------------------------------------------------
//Trước khi gửi, kiểm tra xem PSID có quyền gửi hay không
function sendHashtag(PSID, Hashtag, Content) {
  db.findDocs("Messenger", "Hashtags", {"name":Hashtag}, function( error, docs) {
    if (docs[0]) {
      var PSIDs;
      if (typeof(docs[0].PSID) == "string") {
        PSIDs = [docs[0].PSID];
      } else {
        PSIDs = docs[0].PSID;
      }
      if (inArray(PSID, PSIDs)) {
        //Tạo một tin nhắn Broadcast để chuẩn bị gửi
        request({
          uri: "https://graph.facebook.com/v2.11/me/message_creatives",
          qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
          method: "POST",
          json: {
            "messages": [
            {
              "dynamic_text": {
                "text": "[#" + Hashtag + "] " + Content,
                "fallback_text": "OK"
              } 
            }
          ]
          }
        }, (err, res, data) => {
          if (data) {
            var message_creative_id = data.message_creative_id;
            history(PSID, "Tạo tin nhắn để phát tán", "ID tin nhắn: " + message_creative_id); 
            callSendAPI(PSID, "Đang chuẩn bị để gửi...");
            request({
              uri: "https://graph.facebook.com/v2.11/me/broadcast_messages",
              qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
              method: "POST",
              json: {    
                "message_creative_id": message_creative_id,
                "custom_label_id": docs[0].ID
              }
            }, (err, res, data) => {
                if (data) {
                history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "thành công, ID sự kiện: " + data.broadcast_id);     
                callSendAPI(PSID, "Gửi thành công");
                db.insertDocs("Messenger", "Broadcast_Message", {
                  PSID: PSID,
                  id: data.broadcast_id,
                  Hashtag: Hashtag,
                  Content: Content
                })
              } else {
                history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, lỗi tại sendHashtag, không thể gửi tin nhắn Broadcast");
                if (err) {
                  console.log('lỗi tại sendHashtag');
                  console.log('err: ', err);
                  console.log('body: ', body);
                } 
              }
            });     
        } else {
          history(PSID, "Phát tán tin nhắn có ID: " + message_creative_id, "Thất bại, lỗi tại sendHashtag, không thể tạo tin nhắn Broadcast");   
          if (err) {
            console.log('lỗi tại sendHashtag');
            console.log('err: ', err);
            console.log('body: ', body);
          } 
        }
      }); 
      } else {
        history(PSID, "Không có quyền gửi thẻ", "Thất bại");
        callSendAPI(PSID, "Bạn không có quyền gửi thẻ này. Bạn chỉ có thể gửi tới thẻ mình đã tạo");
      }
    }
    else {
      history(PSID, "Gửi một thẻ không tồn tại",  "Thất bại");
      callSendAPI(PSID, "Thẻ này chưa tồn tại. Bạn chỉ có thể gửi tới thẻ mình đã tạo");
    }
  })
}
//Support Functions
function inArray(item, array) {
  var bool = false;
  array.forEach(element => {
    if (item == element) bool = true;
  })
  return bool;
}
//------------------------------------------------------------------------------
function verify(PSID, Hashtag) {
  if (!Hashtag || Hashtag == "done") return;
  request({
    uri: "https://graph.facebook.com/" + PSID,
    qs: { 
      fields: 'first_name,last_name,profile_pic',
      access_token: process.env.PAGE_ACCESS_TOKEN },
    method: "GET",
  }, (err, res, body) => {
    var data = JSON.parse(body);
    console.log(data);
    if (!data.error) {
      User.findOneAndUpdate(
        { 'verifyCode' :  Hashtag}, 
        {$set: {
          PSID: PSID, 
          first_name: data.first_name, 
          last_name: data.last_name, 
          profile_pic: data.profile_pic, 
          verifyCode: "done"
        }}, 
        function(err, docs) {
          if (docs) {
            callSendAPI(PSID, 'liên kết thành công với tài khoản: ' + docs.local.email);
            history(PSID, "xác minh tài khoản", "Thành công");
          } else {
            callSendAPI(PSID, 'liên kết thất bại với: ' + data.first_name);
            history(PSID, "xác minh tài khoản", "Thất bại");
          }
        }
      ); 
    } else {
        console.log('lỗi tại verify');
        console.log('err: ', err);
        console.log('body: ', body);
    }
  }); 
  
}
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
  //------------------------------------------------------------------------------
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
module.exports.createHashtag = createHashtag;
module.exports.followHashtag = followHashtag;
module.exports.unfollowHashtag = unfollowHashtag;
module.exports.sendHashtag = sendHashtag;
module.exports.deleteHashtag = deleteHashtag;
module.exports.mycreate = mycreate;
module.exports.myfollow = myfollow;
module.exports.help = help;
module.exports.verify = verify;