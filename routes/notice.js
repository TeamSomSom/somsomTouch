var express = require('express');
var router = express.Router();
const noticeController = require('../controller/noticeController');

router.post('/create', noticeController.create);
router.post('/read', noticeController.read);
router.post('/update', noticeController.update);
router.post('/delete', noticeController.delete);

module.exports = router;