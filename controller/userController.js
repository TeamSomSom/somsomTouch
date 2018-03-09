
/**************************** User Controller ****************************/
				/*** request를 계속계속 들고 다닐 방법이 없나....? ***/

var expressSession = require('express-session'),
	express = require('express'), 
	redis = require('redis');

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
	console.log('/process/signup 처리함');
	hasher({password:req.body.password}, function(err, pass, salt, hash){
		var paramId = req.body.id;
		var paramEmail = req.body.email;
		var paramPassword = hash;
		var salt = salt;
		
		console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
	
		store.hmset("user:"+paramId, "pwd", paramPassword, "email", paramEmail, "salt", salt);
		
		// 회원가입후 바로 로그인 시켜주기 
		req.session.displayName = req.body.displayName;
		req.session.save(function(){
			res.redirect('/');
		})
	});
}

/*********************************************************************** 
 *                              User Update  						   
*************************************************************************/

exports.update = function(req, res){
	console.log('/process/update 처리함');

	var user = new User();
	user.password = req.body.password;
	user.email = req.body.email;
	
	res.end();
};

