const express = require('express');
const router = express.Router();
const parishController = require('../controllers/parishController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, parishController.getAllParishes);

module.exports = router;
