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
<<<<<<< Updated upstream
router.post('/detail', noticeController.detail);
=======
router.get('/detail/:id', noticeController.detail);
>>>>>>> Stashed changes

module.exports = router;