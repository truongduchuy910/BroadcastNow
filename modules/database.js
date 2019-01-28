const MongoClient = require('mongodb').MongoClient;
const uri = process.env.uri;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(function(err) {
  if (!err) {
    console.log("Đã mở kết nối tới CSDL");
  } else {
    console.log("Không thẻ kết nối tới CSDL, lỗi: ", err);
  }
})
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

function addUser(PSID) {
  userID = {
    'PSID': PSID
  }
  findDocs('Messenger', 'PSIDs', {'PSID': PSID}, function(error, docs) {
    if (docs[0]) {
    } else {
      insertDocs('Messenger', 'PSIDs', userID);
      console.log('Thêm người dùng: ', PSID);
    }
  })
}
module.exports.addUser = addUser;
module.exports.findDocs = findDocs;
module.exports.insertDocs = insertDocs;
module.exports.deleteDocs = deleteDocs;