var Label       = require('../models/label');

//https://developers.facebook.com/docs/messenger-platform/send-messages

//https://developers.facebook.com/docs/messenger-platform/reference/template/list/
//https://developers.facebook.com/docs/messenger-platform/reference/buttons/postback
//đóng gói để dưới định dạng masage
function list_create(list, index) {
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
                title:"cách tạo thẻ",
                payload:"cách tạo thẻ"
            }
        ]
    };
    return message;
}
module.exports.list_create = list_create;



function list_follow(list, index) {
    var message;var message;
    var text = "Các thẻ bạn đã theo dõi là   là: \n";
    for (var i = 0; i < list.length; i++) {
        text += " - " + list[i].name + "\n";
    };
    
    message = {
        text: text,
        quick_replies:[
            {
                content_type:"text",
                title:"theo dõi public.dut",
                payload:"theo dõi thẻ public.dut"
            }
        ]
    };
    return message;
}
module.exports.list_follow = list_follow;


//notification =  { date: '19/01/2019:',
//    dateObj: {},
//    title: '...',
//    content: '...',
//    body: '...',
//    link:
//     [ { content: '...',
//         url: '...' } ] }
function notification (notification) {
    console.log('--------------------------');
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
function add_label_sucessful(label) {
    var message = {
        text: label
    }
    return message;
}
module.exports.add_label_sucessful = add_label_sucessful;
function simple_message(label) {
    var message = {
        text: label
    }
    return message;

}
module.exports.simple_message = simple_message;
//https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies
function quick_replies(text, quick_replies) {
    var message = {
        text: text,
        quick_replies: quick_replies
    }
    return message;

}
module.exports.quick_replies = quick_replies;


function link(link) {
    var message = {
        attachment:{
          type:"template",
          payload:{
            template_type:"button",
            text: link.content,
            buttons:[
                {
                type: "web_url",
                url: link.url,
                title: "Xem"
                }
            ]
          }
        }
    }
    return message;

}
module.exports.link = link;
function simple_broadcast(label, content) {
    var message = {
        text: "[" + label + "] " + content
    }
    return message;
}
module.exports.simple_broadcast = simple_broadcast;

function attachments_broadcast(label, attachments) {
    var message = {
        attachment: attachments[0]
    }
    return message;
}
module.exports.attachments_broadcast = attachments_broadcast;