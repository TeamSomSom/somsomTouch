// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path')
, session = require('express-session')
, bodyParser = require('body-parser')
, static = require('serve-static')
, expressErrorHandler = require('express-error-handler')
, cookieParser = require('cookie-parser')
, redis = require('redis')
, passport = require('passport')
, LocalStrategy = require('passport-local').Strategy
, flash = require('connect-flash')
var RedisStore = require('connect-redis')(session);

// Express 객체 생성 
var app = express();
app.set('port', process.env.PORT || 3000);
app.use(cookieParser());
app.use(session({
	secret: 'dfwfqfyqf2kfh@kdfowh!1',
	resave: false,
	saveUninitialized: true,
	store: new RedisStore()
}));

app.use(bodyParser.urlencoded({extended: false})); 
app.use(bodyParser.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

app.use('/', require('./routes/user'));
app.use('/notice', require('./routes/notice'));

// routing
var router = express.Router();
var store = redis.createClient();


/*********************************************************************** 
 *                              User LogIn 						   
*************************************************************************/


passport.serializeUser(function(user, done) {
	// console.log('serialize, username: ' + user.username);
    done(null, user.username);
});

passport.deserializeUser(function(id, done) {
	// console.log('deserialize, username: ' + username);

	store.hgetall('user:'+ id, function(err, results) {
		if(results !=null){
			var user = {
				username:id,
				salt:results.salt,
				pwd:results.pwd,
				email:results.email,
			};
			return done(null, user);
		}
	});

});

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var assert = require('assert');

passport.use(new LocalStrategy(

	function(username, password, done) {
		var uname = username;

        store.hgetall('user:'+ username, function(err, results) {
            if(results==null){
                // console.log('id 없음 ');
                return done(null, false);
            } else{
                // console.log('id 있음 ');

                var user = {
                    username:username,
                    salt:results.salt,
                    pwd:results.pwd,
                    email:results.email,
				};
				// console.log('username: ' + user.username + ' salt : ' + user.salt + ' pwd: '+ user.pwd +' email: ' +user.email);

				// upwd 암호화하고 비밀번호 체크
				hasher({password:password, salt:user.salt}, function(err, pass, salt, hash) {
					if(hash === user.pwd){
						console.log("로그인 성공");
	                    return done(null, user);
					} else {
						console.log('비밀번호 불일치');
						return done(null, false);
					}
				});
            }
        });
	}
));

app.post(
	'/user/login', 
	passport.authenticate(
	'local', 
	{ 
		successRedirect: '/',
        failureRedirect: '/',
		failureFlash: true
	})
	
);

/*********************************************************************** 
 *                              User LogOut 						   
*************************************************************************/

app.get('/user/logout', function(req, res){
	console.log('로그아웃');
	req.logout();
	req.session.save(function(){
		res.redirect('/');
	})
});

app.get('/welcome', function(req, res){
	// console.log('session: ' + req.user.username ); //req.session.displayName 으로 더이상 세션 확인 안함
	res.redirect('/mypage.html')
});

/*********************************************************************** 
 *                              User Mypage  						   
*************************************************************************/

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
	  return next();
	res.redirect('/');
};

app.get('/mypage', isAuthenticated, function (req, res) {
	// res.render('mypage',{
	//   title: 'My Page',
	//   user_info: req.user
	// })
	res.redirect('/mypage.html');
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