
/**************************** User Controller ****************************/
				

var expressSession = require('express-session'),
	express = require('express'), 
	redis = require('redis'),
	randomstring = require("randomstring");

// Session
var app = express();
var store = redis.createClient({host:'localhost', port: 6379});


/*********************************************************************** 
 *                              User Create  						   
*************************************************************************/

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var assert = require("assert");

exports.create = function(req, res) {
	// console.log('/user/signup 처리함');
	hasher({password:req.body.password}, function(err, pass, salt, hash){
		var paramId = req.body.userid;
		var paramEmail = req.body.email;
		var paramPassword = hash;
		var salt = salt;
		
		console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
	
		// store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "salt", salt);
		// DB 변경사항 
		store.hmset("user:"+ paramEmail, "username", paramId, "pwd", paramPassword, "salt", salt);
		
		// 회원가입후 바로 로그인 시켜주기 
		req.session.displayName = req.body.userId;
		req.session.save(function(){
			res.redirect('/');
		})
	});
}
/*********************************************************************** 
 *                              User Update  						   
*************************************************************************/

exports.update = function(req, res){
	// console.log('/user/update 처리함');
	// DB 변경사항 
	// store.hset('user:'+ req.user.username, 'pwd', req.body.pwd, 'email', req.body.email);
	store.hset('user:'+ req.user.email, 'pwd', req.body.pwd, 'username', req.user.username);
};

/*********************************************************************** 
 *                              User findID						   
*************************************************************************/

// 이메일을 이용해서 ID 찾기 
exports.findID = function(req, res){
	
};

/*********************************************************************** 
 *                              User findPwd					   
*************************************************************************/

// 이메일과 아이디를 이용해서 비밀번호 찾기 
exports.findPwd = function(req, res){
	console.log('/user/findPwd 실행');
	store.hgetall('user:'+ req.body.username, function(err, results) {
		if(results!=null && results.email == req.body.email){
			var randomStr = randomstring.generate(7);
			res.write('New Password: ' + randomStr);
			console.log('New Password: ' + randomStr);
			
			hasher({password:randomStr}, function(err, pass, salt, hash){
		
				var paramId = req.body.username;
				var paramEmail = req.body.email;
				var paramPassword = hash;
				var salt = salt;
				var winCnt = req.body.winCnt;
				var gameCnt = req.body.gameCnt; 
				
				store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "winCnt", winCnt, "gameCnt", gameCnt, "salt", salt);	
			});
			
			res.end();	
		}
	});
	
};
