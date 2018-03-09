var User = function(){
    this.id;
    this.password;
    this.email;
};

store.hgetall('user:'+ username, function(err, results) {
	var user = {
		username:username,
		salt:results.salt,
		pwd:results.pwd,
		email:results.email,
	};
	console.log('username: ' + user.username + ' salt : ' + user.salt + ' pwd: '+ user.pwd +' email: ' +user.email);
});