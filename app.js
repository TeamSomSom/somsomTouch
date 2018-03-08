// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path')
, bodyParser = require('body-parser')
, static = require('serve-static')
, expressErrorHandler = require('express-error-handler')
, cookieParser = require('cookie-parser')
, expressSession = require('express-session')
, redis = require('redis')
, passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

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
app.use('/', require('./routes/user'));

// routing
var router = express.Router();
var store = redis.createClient();


/*********************************************************************** 
 *                              User LogIn 						   
*************************************************************************/

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(username, done) {
	console.log('serialize, username: ' + username);
    done(null, username);
});

passport.deserializeUser(function(username, done) {
	console.log('deserialize, username: ' + username);
    var ckPwd = store.hmget('user:'+ username, 'pwd', function(err, obj) {
		if(obj !== '') return done(null, username);
	}); 
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		var uname = username;
        var upwd = password;
        var ckPwd = store.hmget('user:'+ uname, 'pwd', function(err, obj) {
	 		console.log('username: ' + uname +' ,password: ' + upwd + ', dbPassword: ' + obj);
			
			if(obj=='') {    // ID 가 존재 하지 않을 경우 
				console.log("Id 없음");
				return done(null, false);
	        } else {
	            if(obj != upwd){    // Password 불일치 
					console.log('비밀번호 불일치');
	                return done(null, false);
	            } else {
					console.log("로그인 성공");
	                return done(null, username);
	            }
			}
		});
	}
));

app.post(
	'/user/login', 
	passport.authenticate(
	'local', 
	{ 
		successRedirect: '/welcome',
        failureRedirect: '/',
		failureFlash: true 
	}
));

/*********************************************************************** 
 *                              User LogOut 						   
*************************************************************************/

app.get('/user/logout', function(req, res){
	console.log('로그아웃');
	req.logout();
	res.redirect('/');
});

app.get('/welcome', function(req, res){
	res.redirect('/');
});

/*********************************************************************** 
 *	                        	Error Handler
*************************************************************************/

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