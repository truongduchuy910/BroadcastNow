const puppeteer = require('puppeteer')
var colors = require('colors');
const webhook = require('./messenger.js')
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

  var data = await page.evaluate(() => { return evaluatePage()});
  await browser.close();
  return data;
}
function evaluatePage() {//nạp  HTML vào body để xử lí và nạp body đã xử lí vào ngược lại HTML
  var body = document.querySelectorAll('body')[0].innerHTML;
  body = '<div>' + body + '</div>';
  body = body.replace(/<p class="MsoNormal">/g, '</div> <div class = "notification"> <p class="MsoNormal">');
  document.querySelectorAll('body')[0].innerHTML = body;
  //brower console: lấy dữ liệu web lưu vào biến data
  var listDivNotification = document.querySelectorAll('div.notification');
  listDivNotification = [...listDivNotification];
  listDivNotification.reverse();
  let list= []    ; 
  listDivNotification.forEach(element => {
      var listLink =element.querySelectorAll('a');
      var collectLink = [];
      listLink.forEach( link => {
          collectLink.push({
              content: link.innerText,
              url: link.href
          });
      });
      var date;
      var dateObj;
      var title;
      try {
        date = element.querySelectorAll('p.MsoNormal>b>span')[0].textContent;
        title = element.querySelectorAll('p.MsoNormal>span')[0].textContent;
        if (date) dateObj = new Date(date.slice(6,10), date.slice(3,5), date.slice(0,2));
      }
      catch(error) {
        date = 'unknown';
        title = 'unknown';
        dateObj = 0;
        console.log(error);
      }
      var allText = element.innerText;                
      // xử lý xóa date và title cho content
      {
        var start = allText.lastIndexOf('\n\n') + 2;
        var end = allText.length;
        var content = allText.slice(start, end);
      }
      var notification = {date: date, dateObj: dateObj,title: title,content: content,link: collectLink, body:allText};
      list.push(notification);
    });  
    return list;    
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
