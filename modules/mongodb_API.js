//Tất cả, và chỉ những tao thác liên quan tới Database sẽ được đặt ở đây
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MessengerURI;
const client = new MongoClient(uri, { useNewUrlParser: true });
var User            = require('../models/users');

client.connect(function(err) {
  if (!err) {
    console.log("MongoDB connected!");
  } else {
    console.log("Không thẻ kết nối tới CSDL, lỗi: ", err);
  }
})
//
function findDocs(dbName, colName, query, callback) {
  client.db(dbName).collection(colName).find(query).toArray(function(err, docs) {
    callback(err, docs);
  });
}

function insertDocs(dbName, colName, docs) {
  client.db(dbName).collection(colName).insertOne(docs);
}

function deleteDocs(dbName, colName, query) {
  client.db(dbName).collection(colName).deleteOne(query);
}
module.exports.findDocs = findDocs;
module.exports.deleteDocs = deleteDocs;



// FIND DATA AREA
//[
//  {
//  _id: "5c4cac4cb780403d8c79f1b0",
//  name: "public.dut",
//  ID: "1865545000216094",
//  PSID: ["1964519013637071", "public.dut"]
//  }
//]
function find_hashtag(query, callback) {
  db.findDocs(process.env.db_messenger, process.env.col_hashtag, query, function(err, docs) {
    if (docs) {
      callback(err, docs);
    } else {
      console.log('modules > database.js > findHashtag');
      console.log('không tìm thấy thẻ ' + Hashtag);
      console.log('dữ liệu: ');
      console.log(docs);
      console.log('lỗi: ');
      console.log(err);
      callback(err, docs);
    }
  })
}
function find_notification (query, callback) {
  findDocs(process.env.db_messenger, process.env.col_public_dut, query, function(error, docs) {
    callback(error, docs)
  });  
}
function find_custom_labels_id (query, callback) {
  findDocs(process.env.db_messenger, process.env.col_hashtag, {name: query}, function(error, docs) {
    callback(error, docs);
  })
}
module.exports.find = {
  hashtag          : find_hashtag,
  notification     : find_notification,
  custom_labels_id : find_custom_labels_id
}






// GET DATA AREA
function get_list_create(PSID, callback) {
  findDocs(process.env.db_messenger, process.env.col_hashtag, {PSID: PSID}, function(err, docs) {
      if (docs) {
          callback(err, docs);
      }
  })
}
function get_list_follow(PSID, callback) {
  request({
      uri: "https://graph.facebook.com/v2.11/" + PSID + "/custom_labels",
      qs: {
        fields: "name",
        access_token : process.env.FACEBOOK_TOKEN
      },
      method: "GET"
    },(err, res, body) => {
      data = JSON.parse(body);
      if (!data.error) {
        callback(err, data.data)
      } 
    }
    )
}
function get_list_broadcastnow(PSID, callback) { 
var data = [];
var complex = [];
findDocs(process.env.db_messenger, process.env.col_broadcast, {PSID: PSID}, (err, docs) => {
    docs.forEach(element => {
      var a = new Promise((resolve, reject) => {
        request({
          uri: "https://graph.facebook.com/v2.11/"+ element.id + "/insights/messages_sent",
          qs: {
            access_token: process.env.FACEBOOK_TOKEN
          },
          method: "GET"
        }, (err, res, Body) => {
          var body = JSON.parse(Body);
          var seen;
          if (!body.error) {
             seen = body.data[0].values[0].value;
          } else {
            seen = 0;
          }
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
module.exports.get = {
  list_create               : get_list_create,
  list_follow               : get_list_follow,
  list_broadcastnow         : get_list_broadcastnow
  
}












//SET DATA AREA
function set_verify(PSID, data, callback) {
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
        history(PSID, "xác minh tài khoản", "Thành công");
        callback(err, docs);
      } else {        
        history(PSID, "xác minh tài khoản", "Thất bại");
        callback(err, docs);
      }
    }
  ); 
}
function set_add_user(PSID) {
  findDocs(process.env.db_messenger, process.env.col_PSID, {PSID: PSID}, function(err, docs) {
    if (docs[0]) {
    } else {
      //https://developers.facebook.com/docs/messenger-platform/identity/user-profile
      request({
        uri: "https://graph.facebook.com/" + PSID,
        qs: { 
          access_token: process.env.FACEBOOK_TOKEN,
          fields: 'first_name,last_name,profile_pic'
        },
        method: "GET",
      }, (err, res, body) => {    
        var data = JSON.parse(body);
        if (data.first_name) {          
          var userID = {
            PSID: PSID,
            first_name: data.first_name,
            last_name: data.last_name,
            profile_pic: data.profile_pic
          }
          insertDocs(process.env.db_messenger, process.env.col_PSID, userID);          
          console.log('Thêm người dùng: ', PSID);
        } else {
          console.log('không bắt được dữ liệu từ PSID trong hàm handleMessage');
          console.log('err: ', err);
          console.log('body: ', body);
        }
      }); 
    }
  })
}
function set_add_hashtag(content) {
  insertDocs(process.env.db_messenger, process.env.col_hashtag, content);
}

function set_remove_hashtag(query) {
  deleteDocs(process.env.db_messenger, process.env.col_hashtag, query);
}
function set_add_broadcast (PSID, broadcast_id, hashtag, content) {
  var time = new Date();
  db.insertDocs(process.env.db_messenger, process.env.col_broadcast, {
    time: time.getTime(),
    PSID: PSID,
    broadcast_id: broadcast_id,
    Hashtag: hashtag,
    Content: content
  })
}
function set_add_notification(content) {
  insertDocs(process.env.db_messenger, process.env.col_public_dut, content);
}
module.exports.set = {
  //verify                    : set_verify,
  //add_user                  : set_add_user,
  add_hashtag               : set_add_hashtag,
  //add_broadcast             : set_add_broadcast,
  //add_notification          : set_add_notification,
  //remove_hashtag            : set_remove_hashtag
}