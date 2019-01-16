getData();
function getData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.response);
        //Prepare data
        for (var i = data.list.length - 1; i >= 0 ; i--) {
            var insert = document.createElement("div");
            insert.className = 'boxNotification';

            {
                var date = document.createElement('span');
                date.className = "date";
                date.innerText = data.list[i].date;
                date.style.color = 'red';
            }
            insert.appendChild(date);            
            {
                var titele = document.createElement('span');
                titele.innerText = data.list[i].title;
            }
            insert .appendChild(titele);
            {
                var content = document.createElement('div');
                content.innerText = data.list[i].content;
            }
            insert.appendChild(content);
            { 
                var listLink = document.createElement('div');
                listLink.className = 'alert alert-warning';
                listLink.innerText = "Tệp đính kèm: ";
                    for (var j = 0; j <= data.list[i].link.length - 1; j++) {
                        var link = document.createElement('a');
                        link.text = data.list[i].link[j].content + '.';
                        link.href = data.list[i].link[j].url;
                        link.target = '_blank';
                        listLink.appendChild(link);
                    }
            }  
            insert.appendChild(listLink);
            //Add data to page
            document.getElementById('notification').appendChild(insert);
        }
      }
    };
    xhttp.open("GET", "/getData", true);
    xhttp.send();
    
}