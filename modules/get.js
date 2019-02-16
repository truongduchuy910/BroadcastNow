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
            data = JSON.parse(body).data;
            callback(err, data)
          } 
        }
      )
}
function listBroadcast(PSID, callback) {

}
module.exports.listCreate = listCreate;
module.exports.listFollow = listFollow;