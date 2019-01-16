const puppeteer = require('puppeteer');
async function get(URL) {
  var browser;
  var page;  

  try {
    console.log('mở trình duyệt');
    //{ args: ['--no-sandbox'] }
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
  } 
  catch (error) {
    await res.send({
      date: '00/00/0000',
      title: 'lỗi khi mở trình duyệt trên máy chủ',
      content: error, 
    });
    await browser.close();
  }
  
  try {
    console.log('mở trang web')
    await page.goto(URL);
  } 
  catch (error) {
    await res.send({
      date: '00/00/0000',
      title: 'lỗi khi truy cập đến trang sv.dut.udn.vn',
      content: error, 
    });
    await browser.close();
  }
    //Get data from website
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
          var contentNotification = listDivNotification[i].innerText;                
          // xử lý xóa date và title cho content
          {
            var start = contentNotification.lastIndexOf('\n\n') + 2;
            var end = contentNotification.length;
            contentNotification = contentNotification.slice(start, end);
          }
          list.push({
              date: dateNotification,
              title: titleNotification,
              content: contentNotification, //include date, title, content
              link: collectLink,
          });
        };     
        return {'list':list};   
    })
    await browser.close();
    return data;
}
module.exports.get = get;