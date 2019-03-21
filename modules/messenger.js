const Wit        = require('./API/wit');
const Ms         = require('./API/messenge');   

const Ms_models  = require('../models/messenger');
var Label        = require('../models/label');
var PSIDs        = require('../models/PSID');
var Message      = require('../models/message');

var Request      = require('./request');

function hand_entry(entry){
    
    var PSID        ; 
    var quick_reply ; 
    var attachments ; 
    var text        ; 
    var postback    ; 
    
    try { 
        PSID        = entry.messaging[0].sender.id;
    } catch (err) {}
    try { 
        quick_reply = entry.messaging[0].message.quick_reply.payload;
    } catch (err) {}
    try { 
        attachments = entry.messaging[0].message.attachments;
    } catch (err) {}
    try { 
        text        = entry.messaging[0].message.text;
    } catch (err) {}
    try { 
        postback    = entry.messaging[0].postback.payloa;
    } catch (err) {}


    add_user(PSID);
    //Quy cả payload quick_reply về text nếu có
    if (quick_reply) {
        text = quick_reply;
    } 
    if (text) Wit.parse(text, function(error, docs) {
        var entities = entity_parse(docs);
        console.log(entities);
        switch (entities.request) {
            case "add_attach"       : 
                Request.add_attach(PSID, entities.label, function(err,docs) {
                    if (docs){
                        var message = Ms_models.add_attach(entities.label);
                        Ms.send(PSID, message, function(err, docs) {
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                }); 
            break;

            case "remove_attach"    : 
                Request.remove_attach(PSID, function(err, docs) {
                    if (docs){
                        var message = Ms_models.remove_attach(entities.label);
                        Ms.send(PSID, message, function(err, docs) {
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                }); 
            break;

            case "list_create"      : 
                Request.list_create(PSID, function(err, docs) {
                    if (docs){
                        var message = Ms_models.list_create(docs);
                        Ms.send(PSID, message, function(err, docs) {
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                    
                });
            break;

            case "list_follow"      : 
                Request.list_follow(PSID, function(err, docs) {
                    if (docs) {
                        var message = Ms_models.list_follow(docs);
                        Ms.send(PSID, message, function(err, docs){
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }  
                });
            break;

            case "add_hashtag"      : 
                Request.add_hashtag(PSID, entities.label, function(err, docs) {
                    if (docs) {
                        var message = Ms_models.add_hashtag(entities.label);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                });
            break;

            case "remove_hashtag"   : 
                Request.remove_hashtag(PSID, entities.label, function(err, docs) {
                    if (docs) {
                        var message = Ms_models.remove_hashtag(entities.label);
                        Ms.send(PSID, message, function(err, docs){
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }   
                });
            break;

            case "follow_hashtag"   : 
                Request.follow_hashtag(PSID, entities.label, function(err, docs) {
                    if (docs) {
                        var message = Ms_models.follow_hashtag(entities.label);
                        Ms.send(PSID, message, function(err, docs){
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                    
                });
            break;

            case "unfollow_hashtag" : 
                Request.unfollow_hashtag(PSID, entities.label, function(err, docs) {
                    if (docs) {
                        var message = Ms_models.unfollow_hashtag(entities.label);
                        Ms.send(PSID, message, function(err, docs){
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                });
            break;

            case "add_broadcast"    : 
                Request.add_broadcast(PSID, entities.label, entities.content, function(err, docs) {
                    console.log(docs);
                    if (docs) {
                        var message = Ms_models.add_broadcast(docs.message, entities.label);
                        Ms.send(PSID, message, function(err, docs){
                        });
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                    
                });
            break; 
            case 'help_create'      : Ms.send(PSID, Ms_models.help_create(), function (error, docs) {}); break; 
            case 'help_remove'      : Ms.send(PSID, Ms_models.help_remove(), function (error, docs) {}); break;
            case 'help_follow'      : Ms.send(PSID, Ms_models.help_follow(), function (error, docs) {}); break;
            case 'help_unfollow'    : Ms.send(PSID, Ms_models.help_unfollow(), function (error, docs) {}); break;
            case 'help_send'        : Ms.send(PSID, Ms_models.help_send(), function (error, docs) {}); break;
        }
    });

    if (attachments) {
        PSIDs.findOne({PSID: PSID}, function(err, docs) {
            var previous_label = docs.previous_label;
            if (previous_label) {
                var message = Ms_models.attachments_broadcast(attachments);
                Ms.broadcast(PSID, previous_label, message, function(err,docs) {
                    if (docs) {
                        var message = Ms_models.add_broadcast(docs.message, previous_label);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    } else if  (err) {
                        var message = Ms_models.error(err.message);
                        Ms.send(PSID, message, function(err, docs) {
                        })
                    }
                }
              );
            } else {
                var message = Ms_models.error('Lỗi, tin nhắn trước đó không thể gửi tệp đính kèm được nữa.');
                Ms.send(PSID, message, function(err, docs){
                })
            }

            Request.remove_attach(PSID, function(err, docs) {
            });
        });
    }

    if (postback) {

    }

}
module.exports.hand_entry = hand_entry;
//----------------------------------------------------------------------------------------------------------------------------------
function entity_parse(docs){
    var request;
    var label  ;
    var number ;
    var CODE   ;
    var content;
    if (docs.entities.request) if (docs.entities.request[0].confidence > 0.77 ) request = docs.entities.request[0].value;
    if (docs.entities.label)   if (docs.entities.label[0].confidence   > 0.55 ) label   = docs.entities.label[0].value;  
    if (docs.entities.number)  if (docs.entities.number[0].confidence  > 0.55 ) number  = docs.entities.number[0].value;
    if (docs.entities.CODE)    if (docs.entities.CODE[0].confidence    > 0.40 ) CODE    = docs.entities.CODE[0].value;
    if (docs.entities.content) if (docs.entities.content[0].confidence > 0.40 ) content = docs.entities.content[0].value;
    return {
      request: request,
      label  : label  ,
      number : number ,
      CODE   : CODE   ,
      content: content
    }
  }
  function add_user(PSID) {
    PSIDs.findOne({PSID: PSID}, function(err, docs){
        if (!docs) {
            Message.findOne({type: 'start'}, function(err, docs) {
                if (docs.message) {
                    Ms.send(PSID, docs.message, function(err, docs) {
                        console.log(docs);
                    })
                } else {
                    console.log(docs);
                }
            });
            Ms.retrieve_profile(PSID, function(err,docs){
                var new_PSID = new PSIDs();
                var d = new Date();
                new_PSID.PSID        = PSID;
                new_PSID.first_name  = docs.first_name;
                new_PSID.last_name   = docs.last_name;
                new_PSID.profile_pic = docs.profile_pic;
                new_PSID.time        = d.getTime();
                new_PSID.save(function(err) {  
                });
            })
         }
    });
  }