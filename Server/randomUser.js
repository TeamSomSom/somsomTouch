// Express 기본 모듈 불러오기
var express = require('express')
    , http = require('http')
    , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
    , static = require('serve-static');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// Redis 사용하기
var redis = require('redis');
var store = redis.createClient();

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave:true,
    saveUninitialized:true
}));

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use(static(path.join(__dirname, 'public')));

// 라우터 객체 참조
var router = express.Router();

var cnt = 0;
router.route('/process/setname').post(function(req, res) {
    console.log('/process/setname 호출됨.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    store.hmset("user:"+(++cnt), "id", paramId, "pwd", paramPassword, redis.print);
    console.log('redis에 사용자를 등록했습니다. : ' + paramId + ' -> ' + paramPassword);
    
    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>서버에서 응답한 결과입니다.</h1>');
    res.write('<div><p>redis에 사용자를 등록했습니다. : ' + paramId + ' -> ' + paramPassword + '</p></div>');
    res.write("'<br><Br><a href='/setname.html'>처음으로 돌아가기</a>");
    res.write("'<br><br><a href='/process/all'>전체 사용자 보기</a>");
    res.end();
});

router.route('/process/getname').post(function(req, res) {
    console.log('/process/getname 호출됨.');

    var paramId = req.body.id || req.query.id;

    store.hget("user", paramId, function(err, username) {
        if (err) { throw err; }

        if (username) {
            console.log('redis에 사용자를 찾았습니다. : ' + paramId + ' -> ' + username);
    
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>서버에서 응답한 결과입니다.</h1>');
            res.write('<div><p>redis에 사용자를 찾았습니다. : ' + paramId + ' -> ' + username + '</p></div>');
            res.write("'<br><Br><a href='/getname.html'>처음으로 돌아가기</a>")
            res.end();
        } else {
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h1>서버에서 응답한 결과입니다.</h1>');
            res.write('<div><p>redis에 사용자를 찾지 못했습니다. : ' + paramId + '</p></div>');
            res.write("'<br><Br><a href='/getname.html'>처음으로 돌아가기</a>")
            res.end();
        }
    });
    
});

router.route('/process/all').get(function(req, res) {
    console.log('/process/all 호출됨.');

    for (var i=1; i <= cnt; i++) {
        store.hgetall("user:"+i, function(err, obj) {
            if (err) { throw err; }

            console.log(obj);
            // var items = [];
            // for (j in obj) {
                // var x = JSON.parse(res[i]);

                // console.log("id : " + obj.id);
                // console.log("pwd : " + obj.pwd);

                // items.push(x);
            // }    
        });
    }

    res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>서버에서 응답한 전체 사용자 결과입니다.</h1>');
    res.end();
});

router.route('/process/random').get(function(req, res) {
    console.log('/process/random 호출됨.');

    var random = new Array();

    for (var i=0; i <= random_num; i++) {
        store.randomkey(function(err, obj) {
            if (err) { throw err; }

            random[i] = obj;
            console.log(random[i]);
        });
    }
});

// 라우터 객체를 app 객체에 등록
app.use('/', router);

// 모든 router 처리 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
        // /public/404.html or /404.html 안됨
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

http.createServer(app).listen(3000, function() {
    console.log('Express 서버가 3000번 포트에서 시작됨.');
    
    // 시작할 때 user 키의 총 갯수 카운트
    store.keys("user:*", function(err, key) {
        if (err) { throw err; }
        
        // console.log(key);
        console.log("lenght : " + key.length);
        cnt = key.length;
    });
});
