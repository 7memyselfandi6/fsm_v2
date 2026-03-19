import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getZoneDetailList,
  getZoneAdjustmentTable,
  zoneLock,
  zoneAdjust
} from '../controllers/zone.controller.js';
import {
  postTotalAdjusted,
  editAdjustment,
  getEnhancedDashboard,
  getAdjustmentHistory
} from '../controllers/enhancedDashboard.controller.js';
import {
  lockZone,
  bulkLockZone,
  getZoneLockStatus
} from '../controllers/lock.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']));

// Administrative Locking (Division Level)
router.post('/division-lock', auditLog('ZONE_DIVISION_LOCK'), lockZone);
router.post('/bulk-lock', authorizeRole(['REGION_MANAGER', 'SUPER_ADMIN']), auditLog('ZONE_BULK_LOCK'), bulkLockZone);
router.get('/lock-status', auditLog('FETCH_ZONE_LOCK_STATUS'), getZoneLockStatus);

router.get('/dashboard-summary', auditLog('FETCH_ZONE_SUMMARY'), getEnhancedDashboard('zone', ['name']));
router.get('/adjust', auditLog('FETCH_ZONE_ADJUSTMENT_HISTORY'), (req, res, next) => {
  req.params.level = 'zone';
  getAdjustmentHistory(req, res, next);
});
router.get('/detail-list', auditLog('FETCH_ZONE_DETAIL_LIST'), getZoneDetailList);
router.get('/adjustment-table', auditLog('FETCH_ZONE_ADJUSTMENT_TABLE'), getZoneAdjustmentTable);
router.post('/lock', auditLog('ZONE_LOCK_DEMAND'), zoneLock);
router.post('/adjust', auditLog('ZONE_ADJUST_DEMAND'), zoneAdjust);
router.post('/total-adjusted-fertilizers', auditLog('POST_ZONE_TOTAL_ADJUSTED'), (req, res, next) => {
  req.params.level = 'zone';
  postTotalAdjusted(req, res, next);
});
router.put('/adjust/:id', auditLog('EDIT_ZONE_ADJUSTMENT'), (req, res, next) => {
  req.params.level = 'zone';
  editAdjustment(req, res, next);
});

export default router;
