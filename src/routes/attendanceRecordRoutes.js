const express = require('express');
const router = express.Router();
const attendanceRecordController = require('../controllers/attendanceRecordController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope, checkPermission('attendance.manage'));

router.get('/history', attendanceRecordController.listAttendanceHistory);
router.get('/eligible-students', attendanceRecordController.getEligibleStudents);
router.get('/', attendanceRecordController.listAttendanceRecords);
router.post('/', attendanceRecordController.createAttendanceRecord);
router.put('/:id', attendanceRecordController.updateAttendanceRecord);
router.delete('/:id', attendanceRecordController.deleteAttendanceRecord);

module.exports = router;
