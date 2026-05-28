const express = require('express');
const router = express.Router();
const attendanceSyncController = require('../controllers/attendanceSyncController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken, checkPermission('attendance.manage'));
router.post('/process', attendanceSyncController.processSync);

module.exports = router;
