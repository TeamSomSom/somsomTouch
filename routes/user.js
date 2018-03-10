var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');

router.post('/user/create', userController.create);
router.post('/user/update', userController.update);
router.post('/user/findID', userController.findID);
router.post('/user/findPwd', userController.findPwd);

module.exports = router;