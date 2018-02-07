// login id 와 passoword 값 전송

// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path');
// Express의 미들웨어 불러오기
var bodyParser = require('body-parser') // ost 방식으로 사용할 수 있게끔 해줌
, static = require('serve-static');
// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Express 객체 생성 
var app = express();
app.set('port', process.env.PORT || 3000);
// use를 통해서 body-parser를 붙임, body-parser가 항상 대기하고 있다가 사용자가 post 던진 데이터를 사용할 수 있게끔 도와줌
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());
// app.use(static(path.join(__dirname + '/public')));  // 이거 원리를 모르겠음 그리고 안돌아감 ???
app.use(express.static('public'));

// 로그인 화면으로 이동 
app.get('/login', function(req, res){
	// res.send("login please")
	res.redirect('/login.html'); 
})

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

// 모든 router 처리 끝난 후 404 오류 페이지 처리
// 서버를 시작하기 위해 호출하는 코드 위쪽에 추가 
var errorHandler = expressErrorHandler({
	static: {
		'404' : './public/404.html'
	}
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(3000, function(){
	console.log('Express 서버가 3000번 포트에서 시작됨.');
});

