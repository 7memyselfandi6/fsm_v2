import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getFederalDashboard,
  getMasterData,
  getFederalFarmerRequests,
  postFederalAdjust
} from '../controllers/federal.controller.js';
import {
  postTotalAdjusted,
  editAdjustment,
  getEnhancedDashboard
} from '../controllers/enhancedDashboard.controller.js';
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
/**
 * @openapi
 * /api/federal/dashboard-enhanced:
 *   get:
 *     summary: Get enhanced federal dashboard with pagination and filtering
 *     tags: [Federal]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/dashboard-enhanced', auditLog('FETCH_FEDERAL_DASHBOARD_ENHANCED'), getEnhancedDashboard('federal', ['name']));
router.get('/master-data', auditLog('FETCH_MASTER_DATA'), getMasterData);
router.post('/adjust', auditLog('SUBMIT_FEDERAL_ADJUSTMENT'), postFederalAdjust);
router.post('/total-adjusted-fertilizers', auditLog('POST_FEDERAL_TOTAL_ADJUSTED'), postTotalAdjusted);
router.put('/adjust/:id', auditLog('EDIT_FEDERAL_ADJUSTMENT'), editAdjustment);
router.get('/farmer-requests', auditLog('FETCH_FEDERAL_FARMER_REQUESTS'), getFederalFarmerRequests);

export default router;
