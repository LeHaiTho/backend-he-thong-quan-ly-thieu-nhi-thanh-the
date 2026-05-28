const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', semesterController.getAllSemesters);

module.exports = router;
