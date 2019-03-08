
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
module.exports.insertDocs = insertDocs;
module.exports.deleteDocs = deleteDocs;
