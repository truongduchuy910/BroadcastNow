var Label       = require('../models/label');

//https://developers.facebook.com/docs/messenger-platform/send-messages

//https://developers.facebook.com/docs/messenger-platform/reference/template/list/
//https://developers.facebook.com/docs/messenger-platform/reference/buttons/postback



//đóng gói để dưới định dạng masage




function list_create(list) {
    var message;
    var text = "Các thẻ bạn đã tạo là: \n";
    for (var i = 0; i < list.length; i++) {
        text += " - " + list[i].name + "\n";
    };
    
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách theo dõi",
                payload:"list_follow"
            },
            {
                content_type:"text",
                title:"cách xóa thẻ",
                payload:"help_remove"
            }
        ]
    };
    return message;
}
module.exports.list_create = list_create;


function list_follow(list) {
    var message;
    var text = "Các thẻ bạn đã theo dõi là: \n";
    for (var i = 0; i < list.length; i++) {
        text += " - " + list[i].name + "\n";
    };
    
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            },
            {
                content_type:"text",
                title:"cách bỏ theo dõi",
                payload:"help_unfollow"
            }
        ]
    };
    return message;
}
module.exports.list_follow = list_follow;


function add_hashtag(label) {
    var message;
    var text = "Bạn đã tạo thành công, thẻ " + label + "."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            }
        ]
    };
    return message;
}
module.exports.add_hashtag = add_hashtag;


function remove_hashtag(label) {
    var message;
    var text = "Bạn đã xóa thành công, thẻ " + label + "."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            }
        ]
    };
    return message;
}
module.exports.remove_hashtag = remove_hashtag;


function follow_hashtag(label) {
    var message;
    var text = "Bạn đã theo dõi thành công, thẻ " + label + "."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách theo dõi",
                payload:"list_follow"
            }
        ]
    };
    return message;
}
module.exports.follow_hashtag = follow_hashtag;


function unfollow_hashtag(label) {
    var message;
    var text = "Bạn đã bỏ theo dõi thành công, thẻ " + label + "."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách theo dõi",
                payload:"list_follow"
            }
        ]
    };
    return message;
}
module.exports.unfollow_hashtag = unfollow_hashtag;


function add_attach(label) {
    var message;
    var text = "Hệ thống đang đợi bạn gửi một hình ảnh, tệp... Để chuyển tiếp vào thẻ " + label + "."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Hủy đợi",
                payload:"remove_attach " + label
            }
        ]
    };
    return message;
}
module.exports.add_attach = add_attach;


function remove_attach(label) {
    var message;
    var text = "Đã hủy lệnh."; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            }
        ]
    };

    return message;
}
module.exports.remove_attach = remove_attach;


function add_broadcast(text, label) {
    var message;
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Đính kèm tiếp",
                payload:"add_attach " + label
            }
        ]
    };
    return message;
}
module.exports.add_broadcast = add_broadcast;



function notification (notification) {
    var message = {
        attachment:{
          type:"template",
          payload:{
            template_type:"button",
            text: "[public.dut] " + notification.date + " " + notification.title,
            buttons:[
                {
                    type:"web_url",
                    url: process.env.notificationURL+"?ID="+notification.ID,
                    webview_height_ratio: "compact",
                    title:"Chi tiết",
                    messenger_extensions: "true"
                }
            ]
          }
        }
    }
    return message;
}
module.exports.notification = notification;


function error(error) {
    var message;
    var text = error; 
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"Trợ giúp",
                payload:"notification_to_admin"
            }
        ]
    };
    return message;
}
module.exports.error = error;


function simple_broadcast(label, content) {
    var message = {
        text: "[" + label + "] " + content
    }
    return message;
}
module.exports.simple_broadcast = simple_broadcast;

function attachments_broadcast(attachments) {
    var message = {
        attachment: attachments[0]
    }
    return message;
}
module.exports.attachments_broadcast = attachments_broadcast;



//------------------------------------
// DANH SACH HUONG DAN
//-----------------------------------
function help_create() {
    var message;
    message = {
        text: 'Để tạo thẻ tên yourlabel, bạn nhắn: Tạo thẻ yourlabel. Tên thẻ của bạn không nên có dấu cách nhé.',
        quick_replies:[
            {
                content_type:"text",
                title:"Cách phát tán tin",
                payload:"help_send"
            },
            {
                content_type:"text",
                title:"Cách xóa thẻ",
                payload:"help_remove"
            },
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            }
        ]
    };
    return message;
}
module.exports.help_create = help_create;
function help_remove() {
    var message;
    message = {
        text: 'Để xóa thẻ tên yourlabel, bạn nhắn: Xóa thẻ yourlabel.',
        quick_replies:[
            {
                content_type:"text",
                title:"Cách tạo thẻ",
                payload:"help_create"
            },
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            }
        ]
    };
    return message;
}
module.exports.help_remove = help_remove;
function help_follow() {
    var message;
    message = {
        text: 'Để theo dõi thẻ tên yourlabel, bạn nhắn: Theo dõi yourlabel.',
        quick_replies:[ 
            {
                content_type:"text",
                title:"Cách bỏ theo dõi thẻ",
                payload:"help_unfollow"
            },
            {
                content_type:"text",
                title:"Danh sách theo dõi",
                payload:"list_follow"
            }
        ]
    };
    return message;
}
module.exports.help_follow = help_follow;
function help_unfollow() {
    var message;
    message = {
        text: 'Để bỏ theo dõi thẻ tên yourlabel, bạn nhắn: Bỏ theo dõi yourlabel.',
        quick_replies:[
            {
                content_type:"text",
                title:"Cách theo dõi thẻ",
                payload:"help_follow"
            },
            {
                content_type:"text",
                title:"Danh sách theo dõi",
                payload:"list_follow"
            }
        ]
    };
    return message;
}
module.exports.help_unfollow = help_unfollow;

function help_send() {
    var message;
    message = {
        text: 'Để gửi vào thẻ tên yourlabel với nội dung yourcontent, bạn nhắn: Gửi vào thẻ yourlabel yourcontent.',
        quick_replies:[
            {
                content_type:"text",
                title:"Danh sách đã tạo",
                payload:"list_create"
            },
            {
                content_type:"text",
                title:"Cách tạo thẻ",
                payload:"help_create"
            },
            {
                content_type:"text",
                title:"Cách xóa thẻ",
                payload:"help_remove"
            }
        ]
    };
    return message;
}
module.exports.help_send = help_send;