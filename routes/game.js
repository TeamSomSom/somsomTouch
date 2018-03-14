var express = require('express');
var router = express.Router();
const gameController = require('../controller/gameController');

// router.get('/', gameController.read);

router.get('/random', gameController.random);
router.get('/create', gameController.create);
router.get('/delete', gameController.delete);

module.exports = router;