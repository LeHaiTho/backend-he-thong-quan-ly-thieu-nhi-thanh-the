const express = require('express');
const multer = require('multer');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { checkPermission } = require('../middlewares/rbac');
const { verifyToken } = require('../middlewares/authMiddleware');
const { attachAccessScope } = require('../middlewares/accessScope');

router.get('/public/lookup', studentController.lookupStudentPublic);

router.use(verifyToken, attachAccessScope);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok =
      /\.xlsx$/i.test(file.originalname) ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ok) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file .xlsx'));
  },
});

// Import / mẫu Excel — đặt trước /:id để không bị nuốt bởi tham số id
router.get(
  '/import-template',
  checkPermission('student.create'),
  studentController.downloadImportTemplate
);
router.post(
  '/import',
  checkPermission('student.create'),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Lỗi upload file' });
      }
      next();
    });
  },
  studentController.importStudents
);

// Route lấy danh sách học viên - yêu cầu đăng nhập và quyền 'student.read'
router.get('/', checkPermission('student.read'), studentController.getAllStudents);

// Route lấy chi tiết học viên
router.get('/:id', checkPermission('student.read'), studentController.getStudentById);

// Route tạo học viên mới
router.post('/', checkPermission('student.create'), studentController.createStudent);

// Route cập nhật học viên
router.put('/:id', checkPermission('student.update'), studentController.updateStudent);

// Route xóa học viên
router.delete('/:id', checkPermission('student.delete'), studentController.deleteStudent);

module.exports = router;
