
// login id 와 passoword 값 전송

// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
, static = require('serve-static');

// Express 객체 생성 
var app = express();
app.set('port', process.env.PORT || 3000)

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(static(path.join('public')));

// 라우터 객체 참조
var router = express.Router();
//라우팅 함수 등록
router.route('/process/login').post(function(req, res) {
	console.log('/process/login 처리함');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id: ' + paramId + '</p></div>');
	res.write('<div><p>Param password: ' + paramPassword + '</p></div>');
	res.end();
});

app.use('/', router);

http.createServer(app).listen(3000, function(){
	console.log('Express 서버가 3000번 포트에서 시작됨.');
});
