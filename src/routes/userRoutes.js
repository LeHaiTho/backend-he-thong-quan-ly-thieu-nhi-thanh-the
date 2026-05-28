const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');

// Tất cả các route dưới đây đều yêu cầu đăng nhập và quyền 'system.manage'
router.use(verifyToken);
router.use(checkPermission('system.manage'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
