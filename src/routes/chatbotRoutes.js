const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route xử lý chat hỏi đáp của phụ huynh
router.post('/chat', chatbotController.handleChat);

module.exports = router;
