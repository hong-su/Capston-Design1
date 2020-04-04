const mysql = require('mysql');
const request = require('request');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var cur_date = moment().format('YYYYMMDD');
var cur_time = moment().format('HH00')-100;

var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getUltraSrtNcst';
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=*****************************'; /* Service Key*/         //removed
queryParams += '&' + encodeURIComponent('ServiceKey') + '=' + encodeURIComponent('-');       /* 공공데이터포털에서 받은 인증키 */
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1');           /* 페이지번호 */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10');       /* 한 페이지 결과 수 */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('JSON');      /* 요청자료형식(XML/JSON)Default: XML */
queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(cur_date);   /* 15년 12월 1일 발표 */
queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(cur_time);   /* 06시 발표(정시단위) */
queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('59');              /* 예보지점의 X 좌표값 */
queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('126');             /* 예보지점 Y 좌표 */

var connection = mysql.createConnection({
    host: 'localhost',
    user: '****',     //removed
    password: '****', //removed
    database: '****' //removed
})
connection.connect();

function insert_sensor(temp) {
    obj = {};
    obj.temp = temp;

    var query = connection.query('insert into sensors_prac set ?', obj, function(err, rows, cols) {
        if (err) throw err;
        console.log("database insertion ok= %j", obj);
        process.exit();
    });
}

request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {
    var data = JSON.parse(body);
    var temperature = data.response.body.items.item[3].obsrValue;
    insert_sensor(temperature);
});
