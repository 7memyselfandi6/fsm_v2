import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getWoredaSummary,
  getWoredaDetailList,
  getWoredaAdjustmentTable,
  woredaLock,
  woredaAdjust
} from '../controllers/woreda.controller.js';
import {
  postTotalAdjusted,
  editAdjustment,
  getEnhancedDashboard,
  getAdjustmentHistory
} from '../controllers/enhancedDashboard.controller.js';
import {
  lockWoreda,
  bulkLockWoreda,
  getWoredaLockStatus
} from '../controllers/lock.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']));

// Administrative Locking (Division Level)
router.post('/division-lock', auditLog('WOREDA_DIVISION_LOCK'), lockWoreda);
router.post('/bulk-lock', authorizeRole(['ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']), auditLog('WOREDA_BULK_LOCK'), bulkLockWoreda);
router.get('/lock-status', auditLog('FETCH_WOREDA_LOCK_STATUS'), getWoredaLockStatus);

router.get('/dashboard-summary', auditLog('FETCH_WOREDA_SUMMARY'), getEnhancedDashboard('woreda', ['name']));
router.get('/adjust', auditLog('FETCH_WOREDA_ADJUSTMENT_HISTORY'), (req, res, next) => {
  req.params.level = 'woreda';
  getAdjustmentHistory(req, res, next);
});
router.get('/detail-list', auditLog('FETCH_WOREDA_DETAIL_LIST'), getWoredaDetailList);
router.get('/adjustment-table', auditLog('FETCH_WOREDA_ADJUSTMENT_TABLE'), getWoredaAdjustmentTable);
router.post('/lock', auditLog('WOREDA_LOCK_DEMAND'), woredaLock);
router.post('/adjust', auditLog('WOREDA_ADJUST_DEMAND'), woredaAdjust);
router.post('/total-adjusted-fertilizers', auditLog('POST_WOREDA_TOTAL_ADJUSTED'), (req, res, next) => {
  req.params.level = 'woreda';
  postTotalAdjusted(req, res, next);
});
router.put('/adjust/:id', auditLog('EDIT_WOREDA_ADJUSTMENT'), (req, res, next) => {
  req.params.level = 'woreda';
  editAdjustment(req, res, next);
});

export default router;
