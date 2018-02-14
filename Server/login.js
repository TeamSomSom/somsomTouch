
// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path')
, bodyParser = require('body-parser')
, static = require('serve-static')
, expressErrorHandler = require('express-error-handler')
, cookieParser = require('cookie-parser')
, expressSession = require('express-session');

// Express 객체 생성 
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(cookieParser());
app.use(expressSession({
    secret:'my key',
    resave: true,
    saveUninitialized:true
}));
app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());
app.use(express.static('public'));

// routing
var router = express.Router();
app.get('/login', function(req, res){
	res.redirect('/login.html'); 
});

router.route('/process/login').post(function(req, res) {
	console.log('/process/login 처리함');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	// 로그인 라우팅 함수 - 로그인 후 세션 저장함
	if (req.session.user) {
		// 이미 로그인된 상태
		console.log('이미 로그인되어 이동합니다.');
		res.redirect('/loginConfrim.html');
	} else {
		// 세션 저장
		req.session.user = {
			id: paramId,
			name: '소녀시대',
			authorized: true
		}
	}
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id: ' + paramId + '</p></div>');
	res.write('<div><p>Param password: ' + paramPassword + '</p></div>');
	res.write('<a href="/loginConfirm.html">컨펌 페이지로 이동하기</a>')
	res.end();
});

// 로그아웃 라우팅 함수 - 로그아웃 후 세션 삭제함
router.route('/process/logout').get(function(req, res){
	console.log('/process/logout 호출됨')
	
	if (req.session.user) {
		// 로그인된 상태
		console.log('로그아웃합니다.');

		req.session.destroy(function(err) {
			if(err) {throw err;}
		
			console.log('세션을 삭제하고 로그아웃되었습니다.');
			res.redirect('/login.html');
		});
	} else {
		// 로그인 안된 상태
		console.log('아직 로그인되어 있지 않습니다.');
		res.redirect('/login.html')
	}
});

router.route('/process/showCookie').get(function(req, res) {
	console.log('/process/showCookie 호출됨.');
	res.send(req.cookies);
 });

 router.route('/process/setUserCookie').get(function(req, res) {
	console.log('/process/setUserCookie 호출됨.');
	
	// 쿠키 설정
	res.cookie('user', {
	 id: 'mike',
	 name: '소녀시대',
	 authorized: true    
	});
 
	// redirect로 응답
	res.redirect('/process/showCookie');
 });

 // session 
 router.route('/').get(function(req, res){
     console.log('/process/main 호출됨.');
     
     if(req.session.user) {
        console.log('session 있음');
        res.redirect('/loginConfirm.html');
     }
     else {
        console.log('session 없음');
         res.redirect('/login.html');
     }
 });

app.use('/', router);

//error
var errorHandler = expressErrorHandler({
	static: {
		'404' : './public/404.html'
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// server-start
http.createServer(app).listen(3000, function(){
	console.log('Express 서버가 3000번 포트에서 시작됨.');
});

//테스트