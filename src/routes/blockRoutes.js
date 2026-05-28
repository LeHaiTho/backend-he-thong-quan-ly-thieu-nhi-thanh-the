const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope);

router.get('/', blockController.getAllBlocks);
router.post('/', checkPermission('department.manage'), blockController.createBlock);
router.put('/:id', checkPermission('department.manage'), blockController.updateBlock);
router.delete('/:id', checkPermission('department.manage'), blockController.deleteBlock);

module.exports = router;
