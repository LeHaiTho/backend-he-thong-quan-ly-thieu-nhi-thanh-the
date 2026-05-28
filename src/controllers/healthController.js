// Controller kiểm tra trạng thái server
const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
