const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { attachAccessScope } = require('../middlewares/accessScope');

router.use(verifyToken, attachAccessScope);

router.get('/', classController.getAllClasses);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;
