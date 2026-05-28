const express = require('express');
const router = express.Router();
const scoreConfigController = require('../controllers/scoreConfigController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', scoreConfigController.getScoreConfigs);
router.post('/bulk', scoreConfigController.saveScoreConfigs);

module.exports = router;
