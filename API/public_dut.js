
const puppeteer = require('puppeteer');
const db = require('../modules/mongodb_API');
const ms_model = require('../models/messenger');
const ms = require('../modules/messenger_API');
var Public_dut           = require('../models/public.dut');
async function new_notifications(callback) {
    console.log('chạy hàm new_notifications()');

    var browser = await puppeteer.launch(
      { args: ['--no-sandbox'] }
    );    
    console.log('mở trình duyệt');

    var page = await browser.newPage();
    console.log('mở trang tab');

    await page.goto('http://sv.dut.udn.vn/G_Thongbao.aspx');
    console.log('truy cập website');
    
    var data = await page.evaluate(() => {
        //Tách và đưa các thông báo vào các thẻ div
        var body = document.querySelectorAll('body')[0].innerHTML;
        body = '<div>' + body + '</div>';
        body = body.replace(/<p class="MsoNormal">/g, '</div> <div class = "notification"> <p class="MsoNormal">');
        document.querySelectorAll('body')[0].innerHTML = body;


        //lấy dữ liệu bằng HTML DOM
        var div_notifications = document.querySelectorAll('div.notification');
        div_notifications = [...div_notifications];
        div_notifications.reverse();

        var notification = []; 
        div_notifications.forEach(element => {

            var link = [];
            //
            var div_link = element.querySelectorAll('a');
            div_link.forEach( element => {
                link.push({
                    content: element.innerText,
                    url: element.href
                });
            });

            var date;
            var dateObj;
            var title;
            //thỉnh thoảng trang trường bị lỗi đăng thông báo và header rời nhau
            try {
              date = element.querySelectorAll('p.MsoNormal>b>span')[0].textContent;
              title = element.querySelectorAll('p.MsoNormal>span')[0].textContent;
              if (date) dateObj = new Date(date.slice(6,10), date.slice(3,5), date.slice(0,2));
            }
            catch(error) {
              date = 'error';
              title = 'error';
              dateObj = null;
            }
            var Body = element.innerText
            var content = Body.slice(Body.lastIndexOf('\n\n') + 2, Body.length);                     
            notification.push({
                date: date, 
                dateObj: dateObj,
                
                title: title,
                content: content,
                
                body: Body,
                link: link,
            });
        });  
        return notification;    
    });
    console.log('đã lấy được dữ liệu');
    await browser.close();
    console.log('đóng trình duyệt');
    // đến đây data đã có kết quả là list notification 

    //Thiết lập bất đồng bộ
    var async = [];
    data.forEach(element => {
        var promise_function = new Promise((resolve, reject) => {
            Public_dut.findOne({title: element.title}, function(error, docs){
                if (!docs) {
                    resolve(element);
                } else {
                    resolve();
                }
            })
        });
        async.push(promise_function);        
    });   
    Promise.all(async)
    .then(function(docs) {
        docs.forEach(element => {
            if (element) {
                var new_public_dut = new Public_dut();
                new_public_dut.date    = element.date    ;
                new_public_dut.title   = element.title   ;
                new_public_dut.content = element.content ;
                new_public_dut.link    = element.link    ;
                new_public_dut.body    = element.body    ;
                new_public_dut.save(function(err) {   
                });
                //ms.broadcast(process.env.public_dut, "public.dut", ms_model.notification(element))
                //db.set.add_notification(element);
            }
        })
        callback({}, docs);
    })
}
module.exports.new_notifications = new_notifications;