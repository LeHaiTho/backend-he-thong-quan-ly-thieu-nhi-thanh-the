const express = require('express');
const router = express.Router();
const scoreTypeController = require('../controllers/scoreTypeController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', scoreTypeController.getAllScoreTypes);

module.exports = router;
