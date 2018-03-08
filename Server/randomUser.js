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

// 로그인할 때 사용자가 접속 중임을 나타내는 키(online)에 아이디 추가
router.route('/process/login-online').post(function(req, res) {
    console.log('/process/login-online 호출됨.');

    var userId = req.body.id || req.query.id; 
    console.log('userId - ' + userId + '추가');

    store.sadd('online', userId, function(err, obj) {
        if (err) { throw err; }
    
        if (obj > 0) {
            console.log(userId + ' online 되었습니다.');
        } else {
            console.log('실패')
        }
    });
});

// 로그아웃할 때 사용자가 접속 중임을 나타내는 키(online)에 아이디 삭제
router.route('/process/logout-offline').post(function(req, res) {
    console.log('/process/logout-offline 호출됨.');

    var userId = req.body.id || req.query.id; 
    console.log('userId - ' + userId + '삭제');

    store.srem('online', userId, function(err, obj) {
        if (err) { throw err; }

        if (obj > 0) {
            console.log(userId + ' offline 되었습니다.');
        } else {
            console.log('삭제 실패')
        }
    });
});

var num = 4; // 랜덤매칭하고자 하는 사람 수
router.route('/process/random2').get(function(req, res) {
    console.log('/process/random2 호출됨.');

    var online_length; // 온라인인 유저 카운트
    var arr = new Array(); // 온라인인 유저들의 배열
    var randomNumArr = new Array(); // 랜덤 숫자 배열

    // var playAlert = setInterval(function() {
    //     console.log('abc');
    // }, 3000);
    
    store.smembers('online', function(err, obj) {
        if (err) { throw err; }

        arr = obj;
        online_length = obj.length;

        console.log('온라인 유저 수 : ' + online_length);
        console.log('온라인 유저 - ' + arr);

        if (num > online_length) {
            console.log('조건문 진입');
    
            var waitAlert = setInterval(function() {
                console.log('...다른 사용자를 기다리는 중입니다...');

                store.smembers('online', function(err2, obj2) {
                    if (err2) { throw err2; }

                    arr = obj2;
                    online_length = obj2.length;

                    console.log('온라인 유저 수 : ' + online_length);
                    console.log('온라인 유저 - ' + arr);

                    if (num <= online_length) {
                        clearInterval(waitAlert);
                        res.redirect('/process/random2')
                    }
                });
            }, 3000);      
        } else {
            for (var i = 0; i < num; i++) {
                randomNumArr[i] = Math.floor(Math.random() * online_length);  // 0 ~ online_length-1
                
                for (var j = 0; j < i; j++) { // 이미 뽑힌 사람들인지 중복체크
                    if (randomNumArr[i] == randomNumArr[j]) {
                        i = i - 1;
                        break;
                    }
                }
            }
            
            console.log('랜덤 index : ' + randomNumArr);
        
            var randomUser;
            for (var i = 0; i < num; i++) {
                randomUser = arr[randomNumArr[i]];
                console.log(randomUser);

                // 매칭된 유저는 online 키에서 삭제
                // 게임 끝나면 다시 추가하기!
                store.srem('online', randomUser, function(err, obj) {
                    if (err) { throw err; }
            
                    if (obj > 0) {
                        console.log('offline 되었습니다.');
                    } else {
                        console.log('삭제 실패')
                    }
                });
            }
       }
    });
    
    // 제약조건
    // 1. 이미 랜덤 매칭된 유저는 어떻게 제외..? 채팅방 만들 때 온라인 키에서 지워야되나,,O 게임끝나면 다시 추가하고
    // 2. 매칭할 수 있는 유저가 없을 때(짝수가 안맞을때) 매칭 안된다/는 메세지 출력 O
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
