const express = require('express');
const app = express();
const port = 3003;
const querystring = require('querystring');
const url = require('url');
const bodyparser = require('body-parser');
const moment = require('moment-timezone');
const mysql = require('mysql');
const fs = require('fs');
moment.tz.setDefault("Asia/Seoul");

app.use(express.json());

var connection = mysql.createConnection({
    host: 'localhost',
    user: '****',          //removed
    password: '****',      //removed
    database: '****'       //removed
});

connection.connect();

app.get('/*', function (req, res) {
	var data = url.parse(req.url, true).query;
	var req_length = Object.keys(req.query).length;

	if(req_length == 0){
		var html = fs.readFile('./graph_myroom.html', function (err, html) {
			html = " "+ html;
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
				if(r.temp > -50) data += "[new Date(" + date + "), " + r.temp + "],\n";
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
	}
	else if(data['device_id'] === '') {
		var sql_all_device = 'select * from device_id_t ';  
		connection.query(sql_all_device, function(err, rows, cols) {
			if (err) throw err;

			(async () => {
				var data_print = {};
				for (var i=0; i<rows.length; i++) { 
					var result = await get_device_data(rows[i].device_id);
					data_print[i] = data_device_func(result, rows[i].device_id);

				}
				res.write(JSON.stringify(data_print, null, "\t"));
				res.end();
			})();
		});
	}
	else if(data['device_id'] != '' && req_length == 1) {
		var sql_device_id_exist = 'select * from device_id_t ';
		connection.query(sql_device_id_exist, function(err, rows, cols) {
			if (err) throw err;
			var exist = false;
			for (var i=0; i<rows.length; i++) { //rows.length
				if(rows[i].device_id == data['device_id']) exist = true;
			}
			if(exist == false){
				res.write('Device ID does not exist.');
				res.end();
			}
			else{
				var qstr = 'select * from sensors_';
				qstr += data['device_id'];
				qstr += ' ';
				connection.query(qstr, function(err, rows, cols) {
					if (err) throw err;
					data_print = data_device_func(rows, data['device_id']);
					res.write(JSON.stringify(data_print, null, "\t"));
					res.end();
				});
			}
		});		
	}

	else {
		req_func(data);
		var data_print = {};
		data_print.device_id = data['device_id'];
		data_print.status = "ok";
		data_print.time = moment().format('YYYY-MM-DD HH-mm-ss');
		res.write(JSON.stringify(data_print, null, "\t"));
		res.end();
	}
});

app.post('/', function(req, res){ 
	var data = req.body;

	if(Object.keys(data).length == 0) console.log('test');
	else req_func(data);

	res.end();
});

function get_device_data(device_id) {
	return new Promise((resolve, reject) => {
		var qstr = 'select * from sensors_';
		qstr += device_id;
		qstr += ' ';
	  	connection.query(
			qstr,
			(err, result) => {
		  		return err ? reject(err) : resolve(result);
			}
	 	 );
	});
}
  
function data_device_func(rows, device_id){
	var data_device = {};
	for (var i=rows.length-1, j=0; i>=0; i--, j++) { 
		r = rows[i];
		if(moment() - r.time > 1000*3600) break;
		var data_tmp = {};
		data_tmp.device_id = device_id;
		data_tmp.time = moment(r.time).format('YYYY-MM-DD HH:mm:ss');
		data_tmp.temp = r.temp;
		data_tmp.seq_num = r.seq_num;

		data_device[j] = data_tmp;
	}

	if(Object.keys(data_device).length == 0) {
		data_device.device_id = device_id;
		data_device.temp = 'Data does not exist within the last 24 hours.';
	}
	return data_device;
}

function req_func(data){
	var device_id = data['device_id'];
	var temp = data['temperature_value'];
	var seq_num = data['sequence_number'];
	
	if(!device_id){
		
	}
	else{
		var sql_exist = 'select EXISTS (select * from device_id_t where device_id=';
		sql_exist += device_id;
		sql_exist += ') as success;';

		connection.query(sql_exist, function(err, results){
			if(err) throw err;

			if(!results[0].success){
				var sql_create = 'create table sensors_';
				sql_create += device_id;
				sql_create += ' like sensors_ex;';
				
				connection.query(sql_create, function(err, results){
					if (err) throw err;
					console.log(sql_create);
				});
				
				var sql_insert_id = 'insert into device_id_t (device_id) values (';
				sql_insert_id += device_id;
				sql_insert_id += ');';
				connection.query(sql_insert_id, function(err, results){
					if (err) throw err;
					console.log(sql_insert_id);
				});
			}

			var sql_insert_value = 'insert into sensors_';
			sql_insert_value += device_id;
			sql_insert_value += ' (temp, seq_num) values (';
			sql_insert_value += temp;
			sql_insert_value += ', ';
			sql_insert_value += seq_num;
			sql_insert_value += ');';

			connection.query(sql_insert_value, function(err, results){
				if (err) throw err;
				console.log(sql_insert_value);
			});
		});
	}
}
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
