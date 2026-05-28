const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const logger = require('./middlewares/logging');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 1. Middlewares cơ bản
// Không giới hạn allowedHeaders — phản hồi đúng header preflight (Authorization, X-Requested-With, …)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(logger); // Logging request

// 2. Parse body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Static files - Cho phép truy cập file trong thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Routes
app.use('/api', routes);

// 5. Error handling middleware (phải đặt sau routes)
app.use(errorHandler);

module.exports = app;
