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

// routing
var router = express.Router();
var store = redis.createClient({host:'localhost', port: 6379});

// view engine setting
app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './public');

// routing setting 
app.use('/', require('./routes/user'));
app.use('/notice', require('./routes/notice'));
var ajax = require('./routes/ajax')();
app.use('/ajax', ajax);




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
					winRate: results.winRate
				};

				console.log('username: ' + user.username + ' salt : ' + user.salt + ' pwd: '+ user.pwd +' email: ' +user.email, ' winRate: ' + user.winRate);

				// upwd 암호화하고 비밀번호 체크
				hasher({password:password, salt:user.salt}, function(err, pass, salt, hash) {
					if(hash === user.pwd){

						console.log("로그인 성공");

						/******************** 유저 온라인 상태로 전환 *****************/
						var userId = user.username;
						
						console.log('userId - ' + userId + '추가');
						store.sadd('online', userId, function(err, obj) {
							if (err) { throw err; }
						
							if (obj > 0) {
								console.log(userId + ' online 되었습니다.');
							} else {
								console.log('실패')
							}
						});
						/******************** 유저 온라인 상태로 전환 *****************/

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

	/******************** 유저 오프라인 상태로 전환 *****************/
	var userId = req.user.username;
    console.log('userId - ' + userId + '삭제');

    store.srem('online', userId, function(err, obj) {
        if (err) { throw err; }

        if (obj > 0) {
            console.log(userId + ' offline 되었습니다.');
        } else {
            console.log('삭제 실패')
        }
	});
	/******************** 유저 오프라인 상태로 전환 *****************/
	req.logout();

	req.session.save(function(){	
		res.redirect('/');
	})
});

/*********************************************************************** 
 *                              User Mypage  						   
*************************************************************************/

app.get('/mypage', function(req, res){
	// res.render('index', {user:req.user.username});
	res.render('mypage', {user:req.user.username});
});

app.get('/', function(req, res){
	console.log(req.user)

	var notices = [];
    var x;
    var i = 0;

    var _promise = function (param) {
        return new Promise(function (resolve, reject) {

            store.keys('notice:*', function(err, results){
                if (err) { reject(err); }
                x = results.length;

                if (x == 0) { resolve('none'); } // 아무것도없을때
                else { 
                    results.forEach(function(key){
                        store.hgetall(key, function(err, result) {
                            if (err) { reject(err); }

                            var notice = {
                                id: key,
                                title: result.title,
                                content: result.content,
                                category: result.category,
                                date: result.date                            
                            };
                            notices.push(notice);
                            ++i;
                            if (i == x) { resolve(notices); }
                        });
                    });
                }
            });
        });

    }; //promise 끝

    _promise(true)
    .then(function (text) {
        if (!req.user){
            res.render('index', {notices:text});
        }
        else{
			res.render('index', {notices:text, user:req.user.username});
        }
    }, function (error) {
        console.log(error);
	});

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