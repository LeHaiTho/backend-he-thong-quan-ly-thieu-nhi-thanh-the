const express = require('express');
const router = express.Router();
const attendanceConfigController = require('../controllers/attendanceConfigController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/status', attendanceConfigController.getAttendanceConfigStatus);
router.get('/', attendanceConfigController.getAttendanceConfigs);
router.post('/bulk', attendanceConfigController.saveAttendanceConfigs);

module.exports = router;
