var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');

router.get('/', function(req, res){
	console.log('Main에 들어옴'+ req.session.displayName);
    res.render('index', {user: req.session.displayName});
});
router.get('/find_id_pw', function(req, res){
	res.render('find_idpw');
});
router.get('/sign_up', function(req,res){
	res.render('sign_up');
});

router.post('/user/create', userController.create);
router.post('/user/update', userController.update);
router.post('/user/findID', userController.findID);
router.post('/user/findPwd', userController.findPwd);

module.exports = router;