//Tất cả, và chỉ những tao thác liên quan tới request đến Facebook sẽ được đặt ở đây

var request     = require('request')
var colors      = require('colors');
var User        = require('../models/users');
var Label       = require('../models/label');

// error example
// body = {
//   error: {
//     message: "Invalid parameter",
//     type: "OAuthException",
//     code:100, 
//     error_subcode: 2018210,
//     is_transient: false,
//     error_user_title: "Custom Label Is Duplicated",
//     error_user_msg: "The custom label is duplicated","fbtrace_id":"GaE54l1xYjx"
//   }
// }
// Mục đích của bắt try catch là thỉnh thoảng, body nhận được phải đóng gói lại bằng JSON.parse(body) mới dùng được nếu muốn trỏ body.error


//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#create_label
// body = {
//   "id": 1712444532121303  
// }
function create_label (PSID, Hashtag, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/me/custom_labels",
    qs: { access_token: process.env.FACEBOOK_TOKEN },
    method: "POST",
    json: {name: Hashtag}
  }, (err, res, body) => {  
    try { 
      callback(err, body);
    } catch (error) {
      callback(error, body);

    }
  }); 
};
module.exports.create_label = create_label;
//https://developers.facebook.com/docs/messenger-platform/identity/user-profile
function retrieve_profile (PSID, callback) {
  request({
    uri: "https://graph.facebook.com/" + PSID,
    qs: { 
      access_token: process.env.FACEBOOK_TOKEN,
      fields: "first_name,last_name,profile_pic"
    },
    method: "GET",
  }, (err, res, body) => {   
     callback(err, JSON.parse(body));
  })
}
module.exports.retrieve_profile = retrieve_profile;

//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#associate_label
// body = {
//   "success": true  
// }
function associate_label (PSID, ID, callback) {
    request({
      uri: "https://graph.facebook.com/v2.11/" +  ID + "/label",
      qs: { access_token: process.env.FACEBOOK_TOKEN },
      method: "POST",
      json: {    
        user: PSID
      }
    }, (err, res, body) => {  
      try { 
        callback(err, body)
      } catch (error) {
        callback(error, body)
      }
    }
    ); 
}

module.exports.associate_label = associate_label;
//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages#creating
// body = {
//   "message_creative_id": <BROADCAST_MESSAGE_ID>,
// }
function message_creatives (message, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/me/message_creatives",
    qs: { access_token: process.env.FACEBOOK_TOKEN },
    method: "POST",
    json: {
      messages: [message]
    }
  },(err, res, Body) => {
    callback(err, Body);

  }); 
}

//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#send_label
// body = {
//   "broadcast_id": 827  
// }
function broadcast_messages (message_creative_id, custom_label_id, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/me/broadcast_messages",
    qs: { access_token: process.env.FACEBOOK_TOKEN },
    method: "POST",
    json: {    
      message_creative_id: message_creative_id,
      custom_label_id: custom_label_id
    }
  }, (err, res, Body) => {  
    callback(err, Body);
  }); 
}
function in_array (PSID, PSIDs) {
  var in_array = false;
  if (PSIDs.length) {
    PSIDs.forEach(element => {
      console.log(PSID, element);

      if (element == PSID) in_array = true;
    }) 
  } else {
    if (PSID == PSIDs) in_array = true;
  }
  return in_array;
}
var Broadcast   = require('../models/broadcast');

function broadcast(PSID, label, message, callback) {
  Label.findOne({name: label}, function(error, labels) {
    if (labels) {
      if (in_array(PSID, labels.PSID)) {
        message_creatives(message, function (error, docs) {
          if (docs.message_creative_id) {
            broadcast_messages(docs.message_creative_id, labels.ID, function(error, docs) {
              if (!docs.error) {
                if (message.text) {
                  var new_broadcast     = new Broadcast();
                  new_broadcast.PSID    = PSID;
                  new_broadcast.ID      = docs.broadcast_id;
                  new_broadcast.label   = label;
                  new_broadcast.content = message.text;
                  var d = new Date();
                  new_broadcast.date    = d.getTime();
                  new_broadcast.save(function(err) {

                  });
                }
                console.log('gửi thành công');
              }

              callback(error, docs);
            } )        
          } else {
            console.log('tạo thẻ để phát tán thất bại: ');
            console.log(docs);
          }
        })
      } else {
        console.log('không có quyền gửi thẻ');
      }
    } else {
      console.log('thẻ ' +label+'không tồn tại trên hệ thống');
    }
  })
}
module.exports.broadcast = broadcast;

//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#remove_label
// body = {
//   "success": true  
// }
function unassociate_label (PSID, ID, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/" +  ID + "/label",
    qs: { access_token: process.env.FACEBOOK_TOKEN },
    method: "DELETE",
    json: {    
      user: PSID
    }
  },(err, res, body) => {  
    callback(err, body)
  }); 
}
module.exports.unassociate_label = unassociate_label;

// https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#retrieving_labels_by_psid
function retrieve_PSID_label (PSID, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/"+PSID+"/custom_labels",
    qs: {       
      fields:  "name",
      access_token: process.env.FACEBOOK_TOKEN 
    },
    method: "GET",
  }, (err, res,  body) => {  
    callback(err, JSON.parse(body));
  }); 
}


//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#get_label_details
// body = {
//   "name":"myLabel",
//   "id":"1001200005002"
// }

function get_label_details (custom_label_id, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/" + custom_label_id,
    qs: {       
      fields:  "name",
      access_token: process.env.FACEBOOK_TOKEN 
    },
    method: "GET",
  }, (err, res, Body) => {  
    try { 
      var body = JSON.parse(Body);
      callback(err, body)
    } catch (error) {
      console.log('modules/messenger_API.js/get_label_details')
      console.log(error);
    }
  }); 
}


//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#get_all_labels
// body = {
//   "data": [
//     {
//       "name": "myLabel",
//       "id": "1001200005003"
//     },
//     {
//       "name": "myOtherLabel",
//       "id": "1001200005002"
//     }
//   ],
//   "paging": {
//     "cursors": {
//       "before": "QVFIUmx1WTBpMGpJWXprYzVYaVhabW55dVpycko4U2xURGE5ODNtNFZAPal94a1hTUnNVMUtoMVVoTzlzSDktUkMtQkUzWEFLSXlMS3ZALYUw3TURLelZAPOGVR",
//       "after": "QVFIUmItNkpTbjVzakxFWGRydzdaVUFNNnNPaUl0SmwzVHN5ZAWZAEQ3lZANDAzTXFIM0NHbHdYSkQ5OG1GaEozdjkzRmxpUFhxTDl4ZAlBibnE4LWt1eGlTa3Bn"
//     }
//   }
// }
function get_all_labels (callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/me/custom_labels",
    qs: {       
      fields:  "name",
      access_token: process.env.FACEBOOK_TOKEN 
    },
    method: "GET",
  }, (err, res, Body) => {  
    try { 
      var body = JSON.parse(Body);
      callback(err, body)
    } catch (error) {
      console.log('modules/messenger_API.js/get_all_labels')
      console.log(error);
    }
  }); 
}


//https://developers.facebook.com/docs/messenger-platform/send-messages/broadcast-messages/target-broadcasts#delete_label
// body = {
//   "success": true  
// }
function remove_label (custom_label_id, callback) {
  request({
    uri: "https://graph.facebook.com/v2.11/" + custom_label_id, 
    qs: {       
      access_token: process.env.FACEBOOK_TOKEN 
    },
    method: "DELETE"
  }, (err, res, body) => {  
    callback(err, JSON.parse(body));
  }); 
}

module.exports.remove_label = remove_label;

//https://developers.facebook.com/docs/messenger-platform/send-messages#message_types
// body = {
//   "recipient_id": "1254477777772919",
//   "message_id": "m_AG5Hz2Uq7tuwNEhXfYYKj8mJEM_QPpz5jdCK48PnKAjSdjfipqxqMvK8ma6AC8fplwlqLP_5cgXIbu7I3rBN0P"
// }  
function send (PSID, message, callback) {
  request({
    uri: "https://graph.facebook.com/v2.6/me/messages",
    qs: {       
      access_token: process.env.FACEBOOK_TOKEN 
    },
    method: "POST",
    json:{
      recipient:{
        id: PSID
      },
      message: message
    }
  }, (err, res, body) => {  
    callback(err, body);
  })
}
module.exports.retrieve_PSID_label = retrieve_PSID_label;
module.exports.send = send;

function history(PSID, action, status) {
  var history = PSID + ' > ' + action + ' | phản hồi: ' + status;
  console.log(history.blue);
}