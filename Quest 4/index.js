const express = require('express');
const app = express();
const port = 8000;
const querystring = require('querystring');
const url = require('url');
const bodyparser = require('body-parser');

app.use(express.json());

app.get("/*", function (req, res) {
	var cur_time = new Date().toJSON().substring(0,19).replace('T',' ');
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	var data = {};
	var key = new Array();
	
	key[0] = "Email";
	key[1] = "Stuno";
	key[2] = "Time";
	key[3] = "IP"; 

	data[key[0]] = "h6fngs75@gmail.com";
	data[key[1]] = "20151556";
	data[key[2]] = cur_time;
	data[key[3]] = ip;

	var querydata = url.parse(req.url, true).query;
	var urls = req.originalUrl;
	
	if(Object.keys(querydata).length){
		var data = Object.assign(data, querydata);
	}
	else if(urls.length > 2){
		var urls_split = urls.split('/');
		for(var i = 1 ; i < urls_split.length; i++){
			key[3+i] = String.fromCharCode(i+64);
			data[key[3+i]] = urls_split[i];
		}
	}
	res.write(JSON.stringify(data, null, "\t"));

	res.end();
});

app.post('/', function(req, res){ 
	var data = {};
	var key = new Array();
	var cur_time = new Date().toJSON().substring(0,19).replace('T',' ');
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if (ip.substr(0, 7) == "::ffff:") {
		ip = ip.substr(7)
	}
	
	key[0] = "Email";
	key[1] = "Stuno";
	key[2] = "Time";
	key[3] = "IP"; 

	data[key[0]] = "h6fngs75@gmail.com";
	data[key[1]] = "20151556";
	data[key[2]] = cur_time;
	data[key[3]] = ip;

	var data = Object.assign(data, req.body);
	res.send(data);    
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
