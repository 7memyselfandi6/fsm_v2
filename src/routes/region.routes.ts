import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getRegionSummary,
  getRegionDetailList,
  getRegionAdjustmentTable,
  regionLock,
  regionAdjust
} from '../controllers/region.controller.js';
import {
  lockRegion,
  bulkLockRegion,
  getRegionLockStatus
} from '../controllers/lock.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['REGION_MANAGER', 'SUPER_ADMIN']));

// Administrative Locking (Division Level)
router.post('/division-lock', auditLog('REGION_DIVISION_LOCK'), lockRegion);
router.post('/bulk-lock', authorizeRole(['SUPER_ADMIN']), auditLog('REGION_BULK_LOCK'), bulkLockRegion);
router.get('/lock-status', auditLog('FETCH_REGION_LOCK_STATUS'), getRegionLockStatus);

router.get('/dashboard-summary', auditLog('FETCH_REGION_SUMMARY'), getRegionSummary);
router.get('/detail-list', auditLog('FETCH_REGION_DETAIL_LIST'), getRegionDetailList);
router.get('/adjustment-table', auditLog('FETCH_REGION_ADJUSTMENT_TABLE'), getRegionAdjustmentTable);
router.post('/lock', auditLog('REGION_LOCK_DEMAND'), regionLock);
router.post('/adjust', auditLog('REGION_ADJUST_DEMAND'), regionAdjust);

export default router;
