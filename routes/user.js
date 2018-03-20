var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');

router.get('/find_id_pw', function(req, res){
	res.render('find_idpw');
});
router.get('/sign_up', function(req,res){
	res.render('sign_up');
});
router.get('/user_update', function(req,res){
	res.render('user_update', {user:req.user});
});
router.post('/user/create', userController.create);
router.post('/user/update', userController.update);
router.post('/user/findID', userController.findID);
router.post('/user/findPwd', userController.findPwd);

module.exports = router;