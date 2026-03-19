import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getFederalDashboard,
  getMasterData,
  getFederalFarmerRequests,
  postFederalAdjust
} from '../controllers/federal.controller.js';
// import {
//   postTotalAdjusted,
//   editAdjustment,
//   getEnhancedDashboard,
//   getAdjustmentHistory
// } from '../controllers/enhancedDashboard.controller.js';
import {
  lockMoa,
  bulkLockMoa,
  getMoaLockStatus
} from '../controllers/lock.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['MOA_MANAGER', 'MOA_EXPERT', 'SUPER_ADMIN']));

// Administrative Locking (Division Level)
router.post('/lock', auditLog('MOA_DIVISION_LOCK'), lockMoa);
router.post('/bulk-lock', authorizeRole(['SUPER_ADMIN']), auditLog('MOA_BULK_LOCK'), bulkLockMoa);
router.get('/lock-status', auditLog('FETCH_MOA_LOCK_STATUS'), getMoaLockStatus);

router.get('/dashboard', auditLog('FETCH_FEDERAL_DASHBOARD'), getFederalDashboard);
// router.get('/dashboard-summary', auditLog('FETCH_FEDERAL_SUMMARY'), getEnhancedDashboard('federal', ['name']));
// router.get('/adjust', auditLog('FETCH_FEDERAL_ADJUSTMENT_HISTORY'), (req, res, next) => {
//   req.params.level = 'federal';
//   getAdjustmentHistory(req, res, next);
// });
router.get('/master-data', auditLog('FETCH_MASTER_DATA'), getMasterData);
router.post('/adjust', auditLog('SUBMIT_FEDERAL_ADJUSTMENT'), postFederalAdjust);
// router.post('/total-adjusted-fertilizers', auditLog('POST_FEDERAL_TOTAL_ADJUSTED'), (req, res, next) => {
//   req.params.level = 'federal';
//   postTotalAdjusted(req, res, next);
// });
// router.put('/adjust/:id', auditLog('EDIT_FEDERAL_ADJUSTMENT'), (req, res, next) => {
//   req.params.level = 'federal';
//   editAdjustment(req, res, next);
// });
router.get('/farmer-requests', auditLog('FETCH_FEDERAL_FARMER_REQUESTS'), getFederalFarmerRequests);

export default router;
