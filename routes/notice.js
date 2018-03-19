var express = require('express');
var router = express.Router();
const noticeController = require('../controller/noticeController');

router.get('/', noticeController.read);
router.get('/write', function(req, res){
	res.render('notice_write');
});
router.post('/create', noticeController.create);
router.post('/update', noticeController.update);
router.post('/delete', noticeController.delete);
router.get('/detail', function(req, res){
	res.render('notice_detail');
});
module.exports = router;