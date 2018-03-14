/**************************** Game Controller ****************************/

var express = require('express'), 
    express = require('express'), 
    redis = require('redis');

var store = redis.createClient({host:'localhost', port: 6379});
var app = express();


/*********************************************************************** 
 *                             Game Random					   
*************************************************************************/

var num = 4;
exports.random = function(req, res) {
    console.log('/game/random 호출됨.');

    var online_length; // 온라인인 유저 카운트
    var arr = new Array(); // 온라인인 유저들의 배열
    var randomNumArr = new Array(); // 랜덤 숫자 배열
    
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
                        res.redirect('/game/random');
                    }
                });
            }, 3000);      
        } else {
            console.log('else문..................................');
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
            var time = new Date().toISOString();
            for (var i = 0; i < num; i++) {
                randomUser = arr[randomNumArr[i]];
                console.log(randomUser);

                // 매칭된 유저는 online 키에서 삭제
                // 게임 끝나면 다시 추가하기!

                store.sadd('game:'+ time, randomUser);
                store.srem('online', randomUser, function(err, obj) {
                    if (err) { throw err; }
            
                    if (obj > 0) {
                        console.log('offline 되었습니다.');
                    } else {
                        console.log('삭제 실패');
                    }
                });
            }

            // res.redirect('/game/create');
            res.redirect('/');
       }
    });

};



/*********************************************************************** 
 *                             Game Create					   
*************************************************************************/

var g_id;
exports.create = function(req, res) {
    console.log('/game/create 호출됨.');

    // store.keys('game:*', function(err, key) {
    //     if (err) { throw err; }

    //     console.log(key.length);
    //     g_id = key.length;
    // });

    // store.set('game:'+(++g_id), 0);

    // store.sadd('game:'+new Date().toISOString(), );
};



/*********************************************************************** 
 *                             Game Delete					   
*************************************************************************/

exports.delete = function(req, res) {
    console.log('/game/delete 호출됨.');


};

