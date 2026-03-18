import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getKebeleSummary,
  getKebeleDetailList,
  getKebeleAdjustmentTable,
  kebeleLock,
  kebeleAdjust,
  getKebeles,
  getKebeleById,
  createKebele,
  updateKebele,
  deleteKebele
} from '../controllers/kebele.controller.js';
import {
  lockKebele,
  bulkLockKebele,
  getKebeleLockStatus
} from '../controllers/lock.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

// Administrative Locking (Division Level)
router.post('/division-lock', authorizeRole(['KEBELE_MANAGER', 'WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']), auditLog('KEBELE_DIVISION_LOCK'), lockKebele);
router.post('/bulk-lock', authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']), auditLog('KEBELE_BULK_LOCK'), bulkLockKebele);
router.get('/lock-status', auditLog('FETCH_KEBELE_LOCK_STATUS'), getKebeleLockStatus);

// Dashboard & Adjustments (Scoped to Kebele DA/Manager)
router.get('/dashboard-summary', auditLog('FETCH_KEBELE_SUMMARY'), getKebeleSummary);
router.get('/detail-list', auditLog('FETCH_KEBELE_DETAIL_LIST'), getKebeleDetailList);
router.get('/adjustment-table', auditLog('FETCH_KEBELE_ADJUSTMENT_TABLE'), getKebeleAdjustmentTable);
router.post('/lock', auditLog('KEBELE_LOCK_DEMAND'), kebeleLock);
router.post('/adjust', auditLog('KEBELE_ADJUST_DEMAND'), kebeleAdjust);

// Entity CRUD (Admin only)
router.get('/', auditLog('FETCH_KEBELES'), getKebeles);
router.get('/:id', auditLog('FETCH_KEBELE_BY_ID'), getKebeleById);
router.post('/', authorizeRole(['SUPER_ADMIN']), auditLog('CREATE_KEBELE'), createKebele);
router.put('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('UPDATE_KEBELE'), updateKebele);
router.delete('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('DELETE_KEBELE'), deleteKebele);

export default router;
