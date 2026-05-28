const express = require('express');
const router = express.Router();
const academicYearController = require('../controllers/academicYearController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');

// Tất cả yêu cầu đăng nhập
router.use(verifyToken);

// GET có thể truy cập bởi mọi người dùng đã đăng nhập (cần thiết cho dropdown)
router.get('/', academicYearController.getAllAcademicYears);

// Các thao tác quản lý yêu cầu quyền system.manage
router.post('/', checkPermission('system.manage'), academicYearController.createAcademicYear);
router.put('/:id', checkPermission('system.manage'), academicYearController.updateAcademicYear);
router.patch('/:id/activate', checkPermission('system.manage'), academicYearController.activateAcademicYear);
router.delete('/:id', checkPermission('system.manage'), academicYearController.deleteAcademicYear);

module.exports = router;
