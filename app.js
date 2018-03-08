// Express 기본 모듈 부르기
var express = require('express')
, http = require('http')
, path = require('path')
, bodyParser = require('body-parser')
, static = require('serve-static')
, expressErrorHandler = require('express-error-handler')
, cookieParser = require('cookie-parser')
, expressSession = require('express-session')
, redis = require('redis');

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
app.use('/notice', require('./routes/notice'));

// routing
var router = express.Router();

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



