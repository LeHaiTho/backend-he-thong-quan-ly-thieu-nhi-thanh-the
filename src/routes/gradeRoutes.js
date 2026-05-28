const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken, checkPermission('score.manage'));

router.get('/semester', gradeController.getSemesterGrades);
router.get('/year', gradeController.getYearGrades);

module.exports = router;
