const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope);

router.get('/', checkPermission('student.read'), enrollmentController.getStudentsForEnrollment);
router.post('/bulk', checkPermission('class.transfer'), enrollmentController.saveBulkEnrollments);

module.exports = router;
