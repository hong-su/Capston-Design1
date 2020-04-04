const mysql = require('mysql');
const request = require('request');
const express = require('express');
const app = express();
const port = 3001;
fs = require('fs');

var connection = mysql.createConnection({
  host: 'localhost',
  user: '****',     //removed 
  password: '****', //removed
  database: '****'  //removed
})
connection.connect();

app.get('/graph', function (req, res) {
  console.log('got app.get(graph)');
  var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html;
    console.log('read file');
    var qstr = 'select * from sensors_prac ';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;
      var data = "data.addRows([\n";

      for (var i=0; i<rows.length ; i++) { 
        r = rows[i];
        var date = r.time.getFullYear().toString();
        date += ", ";

        date += r.time.getMonth().toString();
        date += ", ";   

        date += r.time.getDate().toString();
        date += ", ";

        date += r.time.getHours().toString();
        date += ", ";

        date += r.time.getMinutes().toString();
        date += ", ";

        date += r.time.getSeconds().toString();
        data += "[new Date(" + date + "), " + r.temp + "],\n";
      }

      data = data.slice(0, -2);
      data += "\n]);";      

      var header = "data.addColumn('datetime', 'Date/Time');"
      header += "data.addColumn('number', 'Temperature');"

      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
    });
  });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
