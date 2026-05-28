const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, roleController.getAllRoles);

module.exports = router;
