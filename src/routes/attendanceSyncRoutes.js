const express = require('express');
const router = express.Router();
const attendanceSyncController = require('../controllers/attendanceSyncController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/rbac');

router.use(verifyToken, checkPermission('attendance.manage'));

router.get('/', attendanceSyncController.listSyncLogs);
router.post('/:syncId/reprocess', (req, res, next) => {
  req.body = { ...req.body, sync_id: req.params.syncId };
  return attendanceSyncController.processSync(req, res, next);
});
router.get('/:syncId', attendanceSyncController.getSyncLogDetail);

module.exports = router;
