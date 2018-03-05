var express = require('express');
var router = express.Router();
const userController = require('../controller/userController');

router.post('/user/login', userController.login);
router.post('/user/logout', userController.logout);
router.post('/user/create', userController.create);
router.post('/user/update', userController.update);

module.exports = router;