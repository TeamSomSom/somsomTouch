
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
		var paramId = req.body.id;
		var paramEmail = req.body.email;
		var paramPassword = hash;
		var salt = salt;
		
		// console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
	
		store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "salt", salt);
		
		// 회원가입후 바로 로그인 시켜주기 
		req.session.displayName = req.user.username;
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
	store.hset('user:'+ req.user.username, 'pwd', req.body.pwd, 'email', req.body.email);
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
	// console.log('/user/findPwd 실행');
	store.hgetall('user:'+ req.body.username, function(err, results) {
		if(results!=null && results.email == req.body.email){
			var randomStr = randomstring.generate(7);
			res.write('New Password: ' + randomStr);
			store.hmset('user:'+req.body.username, 'pwd', randomStr);	
		}
	});
	res.end();
};
