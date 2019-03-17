const Ms        = require("./API/messenge");
const Ms_models  = require('../models/messenger');
var Label       = require('../models/label');
var PSIDs        = require('../models/PSID');

function list_create(PSID, callback) {
    if (PSID) {
        Label.find({PSID: {$all:[PSID]}}, function( error, docs) {
            if (docs.length > 0) {
                callback(null , docs);
            } else {
                callback({
                    message: 'Bạn chưa tạo thẻ nào cả.'
                }, null);            
            }
        });
    } else {
        callback({
            error: 'Thiếu tham số '
        }, null);
    }
    
}
module.exports.list_create  = list_create;


function list_follow(PSID, callback) {
    if (PSID) {
        Ms.retrieve_PSID_label(PSID, function(error, docs) {
            if (docs.data) {
                callback(null , docs.data);        
            } else {
                callback({
                    message: 'Bạn chưa theo dõi thẻ nào cả.'
                }, null);
            }
        });
    } else {
        callback({
            message: 'Thiếu tham số '
        }, null);
    }
}
module.exports.list_follow = list_follow;


function add_hashtag(PSID, label, callback) {
    if (label && PSID) {
        Ms.create_label(PSID, label, function(error, docs) {
            if (docs.id) {
            new_label = new Label();
            new_label.name = label;
            new_label.ID   = docs.id;
            new_label.PSID = [PSID];
            new_label.save(function(err) {
                if (!err) {
                    callback(null, {
                        message: 'Tạo thẻ thành công'
                    });
                }
            });
            } else {
                callback({
                    message: 'Thẻ đã tồn tại. Vui lòng chọn tên khác.'
                }, null);
            }
        })
  } else {
      callback({
          message: "Thiếu tham số"
      }, null);
  }
}
module.exports.add_hashtag = add_hashtag;


function remove_hashtag(PSID, label, callback) {
    if (PSID && label) {
      Label.findOne({name: label}, function(error, docs) {
        if (docs) {
          if (in_array(PSID, docs.PSID)) {
            Ms.remove_label( docs.ID, function(err, docs) {
                if (docs.success) {
                    Label.deleteOne({name: label}, function(error, docs) {
                        callback(null, {
                            message: 'Gỡ thẻ thành công'
                        })
                    })
                } else {
                    callback({
                       message: docs.error.message
                    }, null);
                }
            })
          } else {
            callback({
                message: 'Bạn không có quyền gửi thẻ ' + label
            }, null);
          }
        } else {
          callback({
              message: 'Thẻ ' + label + ' không tồn tại.'
          }, null);
        }
      })
    } else {
        callback({
            message: "Thiếu tham số"
        }, null);
    }
}
module.exports.remove_hashtag = remove_hashtag;


function follow_hashtag(PSID, label, callback) {
    if (PSID && label) {
        Label.findOne({name: label}, function(error, docs) {
            if (docs) {
              Ms.associate_label(PSID, docs.ID, function(err,docs) {
                console.log(docs);
                if (docs.success) {
                    callback(null, {
                        message: 'Theo dõi thành công.'
                    })
                } else {
                    callback({
                        message: 'Liên kết không thành công.',
                        error: err
                    }, null);
                    console.log(err);
                }
              })
            } else {
                callback({
                    message: "Thẻ " + label + ' không tồn tại.'
                }, null);
            }
        })
    } else {
        callback({
            message: 'Thiếu tham số.'
        }, null)
    }
}
module.exports.follow_hashtag = follow_hashtag;


function unfollow_hashtag(PSID, label, callback) {
    if (PSID && label) {
        Label.findOne({name: label}, function(error, docs) {
            if (docs) {
                Ms.unassociate_label(PSID, docs.ID, function(err,docs) {
                    if (docs.success) {
                        callback(null, docs);
                    } else {
                        callback(err, null);
                    }
                });
            } else {
                callback({
                    message: 'Thẻ ' + label + ' không tồn tại.'
                }, null);
            }
        }) 
    } else {
        callback({
            message: 'Thiếu tham số.'
        }, null)
    }
       
}
module.exports.unfollow_hashtag = unfollow_hashtag;


function add_broadcast(PSID, label, content, callback) {
    if (PSID && label && content) {
        Ms.broadcast(PSID, label, Ms_models.simple_broadcast(label, content), function(error, docs) {
            callback(error, docs);
        });      
    }
}
module.exports.add_broadcast = add_broadcast;


function add_attach(PSID, label, callback) {
    PSIDs.findOneAndUpdate({PSID:PSID}, {previous_label: label}, function(err, docs) {
        console.log('previous_label: ', docs.previous_label);
        if (!err) {
            callback(null, docs);
        } else {
            callback(err, null);
        }
    });
}
module.exports.add_attach = add_attach;


function remove_attach(PSID, callback) {
    PSIDs.findOneAndUpdate({PSID:PSID}, {previous_label: null}, function(err, docs) {
        console.log('previous_label: ', docs.previous_label);
        if (!err) {
            callback(null, docs);
        } else {
            callback(err, null);
        }
    });
}
module.exports.remove_attach = remove_attach;



function in_array(a, b) {
    var bool = false;
    b.forEach(element => {
      if (a === element) bool = true;
    })
    return bool;
  }