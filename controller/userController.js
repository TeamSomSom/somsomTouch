
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
	console.log('/user/signup 처리함');
	hasher({password:req.body.password}, function(err, pass, salt, hash){
		
		var paramId = req.body.id;
		var paramEmail = req.body.email;
		var paramPassword = hash;
		var salt = salt;
		var winCnt = 0;
		var gameCnt = 0; 
		
		// console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
		store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "winCnt", winCnt, "gameCnt", gameCnt, "salt", salt);
		
		// 회원가입후 바로 로그인 시켜주기 
		req.session.displayName = paramId;
		req.session.save(function(){
			res.redirect('/');
		})
	});
}
/*********************************************************************** 
 *                              User Update  						   
*************************************************************************/

exports.update = function(req, res){
	console.log('/user/update 처리함');

	hasher({password:req.body.password}, function(err, pass, salt, hash){
		
		var paramId = req.body.id;
		var paramEmail = req.body.email;
		var paramPassword = hash;
		var salt = salt;
		// var winCnt = 0;
		// var gameCnt = 0; 

		// store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "winCnt", winCnt, "gameCnt", gameCnt, "salt", salt);
		store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "salt", salt);
	});
	res.redirect('/');
};

/*********************************************************************** 
 *                              User findID						   
*************************************************************************/

// 이메일을 이용해서 ID 찾기 
exports.findID = function(req, res){
	store.hgetall('user')
};

/*********************************************************************** 
 *                              User findPwd					   
*************************************************************************/

// 이메일과 아이디를 이용해서 비밀번호 찾기 
exports.findPwd = function(req, res){
	console.log('/user/findPwd 실행');
	console.log(req.body.username);
	console.log(req.body.email);
	store.hgetall('user:'+ req.body.username, function(err, results) {
		if(results!=null && results.email == req.body.email){
			var randomStr = randomstring.generate(7);

			console.log(results.winCnt + ", " + results.gameCnt)
			hasher({password:randomStr}, function(err, pass, salt, hash){
		
				var paramId = req.body.username;
				var paramEmail = req.body.email;
				var paramPassword = hash;
				var salt = salt;
				var winCnt = results.winCnt;
				var gameCnt = results.winCnt; 
				
				store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "salt", salt);	
			});
			
			res.end();
			res.render('new_password', {user:req.user.username, newpwd:randomStr});	
		}
	});
	
};
