
/**************************** User Controller ****************************/
				/*** request를 계속계속 들고 다닐 방법이 없나....? ***/

var expressSession = require('express-session'),
	express = require('express'), 
	redis = require('redis');

// Session
var app = express();

/*********************************************************************** 
 *                              User Create  						   
*************************************************************************/

var store = redis.createClient();
var cnt = 0;
exports.create = function(req, res) {
	console.log('/process/signup 처리함');

	var paramId = req.body.id;
	var paramEmail = req.body.email;
	var paramPassword = req.body.password;
	
	console.log('id: ' + paramId + ', password : ' + paramPassword + ', email: ' + paramEmail);
	
	store.hmset("user:"+(++cnt), "id", paramId, "pwd", paramPassword, "email", paramEmail);
	res.redirect('/');
};

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

