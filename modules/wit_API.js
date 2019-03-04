const request = require('request');
const {Wit, log} = require('node-wit');

const client = new Wit({
  accessToken: process.env.WIT_TOKEN,
  //logger: new log.Logger(log.DEBUG) // optional
});
//https://wit.ai/docs/http/20170307#get__message_link
function parse(message, callback) {
  client.message(message, {})
  .then((data) => {
    callback(data.error, data);
  })
  .catch(console.error);
}

//https://wit.ai/docs/http/20170307#get__message_link
function mean (sentence) {
  request({
    uri: 'https://api.wit.ai/message',
    qs: {
      v: process.env.WIT_version,
      q: sentence
    },
    headers: {
      Authorization: "Bearer " + process.env.WIT_TOKEN
    }
  }, (err, res, body) => { 
    try { 
      var error = body.error;
      callback(error, body)
    } catch (error) {
      console.log('modules/wit_API.js/create_label')
      console.log('dữ liệu: ');
      console.log(body);
      console.log('lỗi: ');
      console.log(err);
    }
  })  
}


//https://wit.ai/docs/http/20170307#get__entities_link
function retrieve_entity () {
  request({
    uri: 'https://api.wit.ai/entities',
    qs: {
      v: process.env.WIT_version,
    },
    headers: {
      Authorization: "Bearer " + process.env.WIT_TOKEN
    }
  }, (err, res, body) => { 
    try { 
      var error = body.error;
      callback(error, body)
    } catch (error) {
      console.log('modules/wit_API.js/retrieve_entity')
      console.log('dữ liệu: ');
      console.log(body);
      console.log('lỗi: ');
      console.log(err);
    }
  })  
}
function create_entity (doc, id) {
  request({
    uri: 'https://api.wit.ai/entities',
    qs: {
      v: process.env.WIT_version,
    },
    headers: {
      Authorization: "Bearer " + process.env.WIT_TOKEN
    },
    d: {
      doc: doc,
      id: id
    }
  }, (err, res, body) => { 
    try { 
      var error = body.error;
      callback(error, body)
    } catch (error) {
      console.log('modules/wit_API.js/retrieve_entity')
      console.log('dữ liệu: ');
      console.log(body);
      console.log('lỗi: ');
      console.log(err);
    }
  })  
}
function retrieve_value_entity (id) {
  request({
    uri: 'https://api.wit.ai/entities/'+id,
    qs: {
      v: process.env.WIT_version,
    },
    headers: {
      Authorization: "Bearer " + process.env.WIT_TOKEN
    }
  }, (err, res, body) => { 
    try { 
      var error = body.error;
      callback(error, body)
    } catch (error) {
      console.log('modules/wit_API.js/retrieve_entity')
      console.log('dữ liệu: ');
      console.log(body);
      console.log('lỗi: ');
      console.log(err);
    }
  })  
}
// BUILDING
module.exports.parse = parse;