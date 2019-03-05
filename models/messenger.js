var Label       = require('../models/label');

//https://developers.facebook.com/docs/messenger-platform/send-messages

//https://developers.facebook.com/docs/messenger-platform/reference/template/list/
//https://developers.facebook.com/docs/messenger-platform/reference/buttons/postback
//đóng gói để dưới định dạng masage
function list_create(list) {
    var message = {
        attachment: {
            type: "template",
            payload: {
                template_type: "list",
                top_element_style: "compact",
                elements: []
            }
        }
    }
    list.forEach(element => {
        var item = {
            title: element.name,
            subtitle: element.describe,            
            buttons: [{
                type: "postback",
                title: "xóa thẻ này",
                payload: "remove_hashtag " + element.name                
            }]
        }
        message.attachment.payload.elements.push(item);
    });
    if (list.length == 1) message.attachment.payload.elements.push({
        title:"...",            
            buttons: [{
                type: "postback",
                title: "...",
                payload: "hello"               
            }]
    })
    return message;
}
module.exports.list_create = list_create;



function list_follow(list) {
    var message = {
        attachment: {
            type: "template",
            payload: {
                template_type: "list",
                top_element_style: "compact",
                elements: []
            }
        }
    }
    list.forEach(element => {
        var item = {
            title: element.name,
            subtitle: element.describe,            
            buttons: [{
                type: "postback",
                title: "bỏ theo dõi",
                payload: "unfollow_hashtag " + element.name                
            }]
        }
        message.attachment.payload.elements.push(item);
    })
    if (list.length == 1) message.attachment.payload.elements.push({
        title:"...",            
            buttons: [{
                type: "postback",
                title: "...",
                payload: "hello"               
            }]
    });
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
    var message = {
        attachment:{
          type:"template",
          payload:{
            template_type:"button",
            text: "[#public.dut] " + notification.date + " " + notification.title,
            buttons:[
                {
                    type:"postback",
                    title:"Link đính kèm",
                    payload:"show_notification_link @"+notification.title
                },
                {
                    type:"postback",
                    title:"Nội dung chi tiết",
                    payload:"show_notification_content @"+notification.title
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
