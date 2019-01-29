const puppeteer = require('puppeteer')
var colors = require('colors');
const webhook = require('./webhook.js')
const db = require('./database.js') 
async function getAll() {
  var browser;
  var page; 
  console.log('mở trình duyệt');
  //{ args: ['--no-sandbox'] }
  browser = await puppeteer.launch(
    {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  );
  page = await browser.newPage();
  console.log('mở trang web')
  await page.goto('http://sv.dut.udn.vn/G_Thongbao.aspx');
  console.log('lấy dữ liệu');

  var data = await page.evaluate(() => {
    //nạp  HTML vào body để xử lí và nạp body đã xử lí vào ngược lại HTML
    var body = document.querySelectorAll('body')[0].innerHTML;
    body = '<div>' + body + '</div>';
    body = body.replace(/<p class="MsoNormal">/g, '</div> <div class = "notification"> <p class="MsoNormal">');
    document.querySelectorAll('body')[0].innerHTML = body;
    //brower console: lấy dữ liệu web lưu vào biến data
    var listDivNotification = document.querySelectorAll('div.notification');
    listDivNotification = [...listDivNotification];
    listDivNotification.reverse();
    let list= []    ; 
    for (var i = 0;i < listDivNotification.length;i++) {
        var listLink = listDivNotification[i].querySelectorAll('a');
        var collectLink = [];
        for (var j = 0; j < listLink.length;j++) {
            collectLink.push({
                content: listLink[j].innerText,
                url: listLink[j].href
            });
        };
        var dateNotification;
        var titleNotification;
        try {
          dateNotification = listDivNotification[i].querySelectorAll('p.MsoNormal>b')[0].textContent;
          titleNotification = listDivNotification[i].querySelectorAll('p.MsoNormal>span')[0].textContent;
        }
        catch(error) {
          dateNotification = 'unknown';
          titleNotification = 'unknown';
        }
        var blockNoti = listDivNotification[i].innerText;                
        // xử lý xóa date và title cho content
        {
          var start = blockNoti.lastIndexOf('\n\n') + 2;
          var end = blockNoti.length;
          var content = blockNoti.slice(start, end);
        }
        var notification = {date: dateNotification,title: titleNotification,content: content,link: collectLink, body:blockNoti};
        list.push(notification);
      };     
      return list;   
  })
  await browser.close();
  return data;
}
async function getNotifications() {
  var notification = await getAll();
  notification.forEach(element => {
    db.findDocs("Messenger", "public.dut", {"body": element.body}, function(error, docs) {
      if(docs[0]) {

      } else {
        console.log("new > ".yellow);
        console.log(element.body);
        webhook.sendHashtag(process.env.public_dut, "public.dut", element.date + element.title);
        db.insertDocs('Messenger', "public.dut", element);
      }
    })
  });
  
  return notification;
}
module.exports.getNotifications = getNotifications;
