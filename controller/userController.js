

/// User Controller ///

/*** request를 계속계속 들고 다닐 방법이 없나....? ***/

var expressSession = require('express-session'),
	express = require('express'), 
	redis = require('redis');

// Session
var app = express();
app.use(expressSession({
	secret:'my key',
	resave: true,
	saveUninitialized:true
}));

// LogIn
exports.login = function(req, res){
    console.log('/process/login 처리함');

	var paramId = req.body.id
	var paramPassword = req.body.password

	// 로그인 라우팅 함수 - 로그인 후 세션 저장함
	if (req.session.user) {
		// 이미 로그인된 상태
		console.log('이미 로그인되어 이동합니다.');
		res.redirect('/loginConfrim.html');
	} else {
		// 세션 저장
		req.session.user = {
			id: paramId,
			name: paramId,
			authorized: true
		}
    }
	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id: ' + paramId + '</p></div>');
	res.write('<div><p>Param password: ' + paramPassword + '</p></div>');
	res.write('<a href="/loginConfirm.html">컨펌 페이지로 이동하기</a>')
	res.end();
};

// LogOut
exports.logout = function(req, res) {
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
};

// Create User
var store = redis.createClient();
var cnt = 0;
exports.create = function(req, res) {
	console.log('/process/signup 처리함');

	var paramId = req.body.id;
	var paramEmail = req.body.email;
	var paramPassword = req.body.password;
	
	console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
	
	store.hmset("user:"+(++cnt), "id", paramId, "pwd", paramPassword, "email", paramEmail);
	res.redirect('/');
};

// Update User
exports.update = function(req, res){
	console.log('/process/update 처리함');

	var user = new User();
	user.password = req.body.password;
	user.email = req.body.email;
	
	res.end();
};