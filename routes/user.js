var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');

router.get('/find_id_pw', function(req, res){
	res.render('find_idpw');
});
router.get('/sign_up', function(req,res){
	res.render('sign_up');
});
router.post('/user/create', userController.create);
router.post('/user/update', userController.update);
router.post('/user/findId', userController.findId);
router.post('/user/findPwd', userController.findPwd);

module.exports = router;