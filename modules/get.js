var db = require('../modules/database');
var request = require('request')

function listCreate(PSID, callback) {
    db.findDocs("Messenger", "Hashtags", {PSID: PSID}, function(err, docs) {
        if (docs) {
            callback(err, docs);
        }
    })
}
function listFollow(PSID, callback) {
    request({
        uri: "https://graph.facebook.com/v2.11/" + PSID + "/custom_labels",
        qs: {
          fields: "name",
          access_token : process.env.PAGE_ACCESS_TOKEN
        },
        method: "GET"
      },(err, res, body) => {
          if (!err) {
            data = JSON.parse(body);
            callback(err, data.data)
          } 
        }
      )
}
function listBroadcast(PSID, callback) { 
  var data = [];
  var complex = [];
  db.findDocs("Messenger", "Broadcast_Message", {PSID: PSID}, (err, docs) => {
      docs.forEach(element => {
        var a = new Promise((resolve, reject) => {
          request({
            uri: "https://graph.facebook.com/v2.11/"+ element.id + "/insights/messages_sent",
            qs: {
              access_token: process.env.PAGE_ACCESS_TOKEN
            },
            method: "GET"
          }, (err, res, Body) => {
            var body = JSON.parse(Body);
            var seen = body.data[0].values[0].value;
            if (seen) {
              resolve({
                Hashtag: element.Hashtag,
                Content: element.Content,
                Seen: seen
              })              
            }
          })
        }) 
        complex.push(a);
      });
      Promise.all(complex)
      .then(function(result) {
        callback(err, result);
      });
})
}
module.exports.listCreate = listCreate;
module.exports.listFollow = listFollow;
module.exports.listBroadcast = listBroadcast;