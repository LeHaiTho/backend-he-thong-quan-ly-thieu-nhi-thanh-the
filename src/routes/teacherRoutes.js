const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope);

router.get('/', teacherController.getAllTeachers);
router.post('/', teacherController.createTeacher);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
