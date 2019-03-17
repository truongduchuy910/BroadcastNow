
const puppeteer = require('puppeteer');
const ms_models = require('../models/messenger');
const ms = require('../modules/API/messenge');
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
            var date;
            var title;
            //thỉnh thoảng trang trường bị lỗi đăng thông báo và header rời nhau
            try {
              date = element.querySelectorAll('p.MsoNormal>b>span')[0].textContent;
              title = element.querySelectorAll('p.MsoNormal>span')[0].textContent;
            }
            catch(error) {
              date = 'error';
              title = 'error';
              dateObj = null;
            }



            element.querySelectorAll('p.MsoNormal')[0].remove();
            var contentHTML = element.innerHTML;

            notification.push({
                date: date, 
                title: title, 
                contentHTML: contentHTML,
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
                var d = new Date();
                var new_public_dut = new Public_dut();
                new_public_dut.date    = element.date    ;
                new_public_dut.dateObj = d.getTime();
                new_public_dut.title   = element.title   ;
                new_public_dut.contentHTML    = element.contentHTML    ;
                new_public_dut.ID      = radom();
                ms.broadcast(process.env.public_dut, "public.dut", ms_models.notification(new_public_dut),function(err,docs){
                    console.log('Gửi Public.dut Thành Công');
                    
                    new_public_dut.save(function(err) {   
                });
                })
            }
        })
        callback({}, docs);
    })
}
module.exports.new_notifications = new_notifications;
function radom() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}