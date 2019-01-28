const webhook = require('./webhook.js');
function parse(message, PSID) {
    var expression = findCommand(message);
    switch(expression) {
        case 'create':
        var hashtag = findHashtag(message);
        if (hashtag) webhook.creatHashtag(PSID, hashtag);
        break;
        case 'follow':
        var hashtag = findHashtag(message);
        if (hashtag) webhook.followHashtag(PSID, hashtag);
        break;
        case 'unfollow':
        var hashtag = findHashtag(message);
        if (hashtag) webhook.unfollowHashtag(PSID, hashtag);
        break;
        case 'send':
        var hashtag = findHashtag(message);
        if (hashtag) webhook.sendHashtag(PSID, hashtag, findContent(message));
        break;
        case 'delete':
        var hashtag = findHashtag(message);
        if (hashtag) webhook.deleteHashtag(PSID, hashtag);
        break;
        case 'mycreate':
        webhook.mycreate(PSID);
        break;
        case 'myfollow':
        webhook.myfollow(PSID);
        break;
        case 'help':
        webhook.help(PSID);
        break;  
        default:
            webhook.callSendAPI(PSID, "Lỗi cú pháp");
        break;
    }
}
function findCommand(content) {
    var end = 0; 
    while (content[end] != ' ' && end < content.length) end++;
    return content.slice(0, end);
}
function findHashtag(content) {
    var start = content.lastIndexOf('#') + 1;
    var end = start + 1;
    while (content[end] != ' ' && end < content.length) end++;
    if (start == 0) {
    } else{
        return content.slice(start, end);
    } 
}
function findContent(content) {
    var hashtag = findHashtag(content);
    var start = findCommand(content).length + 1 + hashtag.length + 2;
    var end = content.length;console.log('start: ', start,' end: ', end);
    var text = '[' + hashtag + ']' + content.slice(start , end);
    return text;
}
module.exports.parse = parse;