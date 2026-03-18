import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getZoneSummary,
  getZoneDetailList,
  getZoneAdjustmentTable,
  zoneLock,
  zoneAdjust
} from '../controllers/zone.controller.js';
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

router.get('/dashboard-summary', auditLog('FETCH_ZONE_SUMMARY'), getZoneSummary);
router.get('/detail-list', auditLog('FETCH_ZONE_DETAIL_LIST'), getZoneDetailList);
router.get('/adjustment-table', auditLog('FETCH_ZONE_ADJUSTMENT_TABLE'), getZoneAdjustmentTable);
router.post('/lock', auditLog('ZONE_LOCK_DEMAND'), zoneLock);
router.post('/adjust', auditLog('ZONE_ADJUST_DEMAND'), zoneAdjust);

export default router;
