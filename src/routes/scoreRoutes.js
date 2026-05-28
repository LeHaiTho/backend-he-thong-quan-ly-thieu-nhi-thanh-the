const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope);

router.get('/', scoreController.getScoresByClass);
router.post('/bulk', scoreController.saveBulkScores);
router.post('/ethics', scoreController.saveEthicsScores);
router.put('/ethics', scoreController.saveEthicsScores);

module.exports = router;
