import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getWoredaSummary,
  getWoredaDetailList,
  getWoredaAdjustmentTable,
  woredaLock,
  woredaAdjust
} from '../controllers/woreda.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']));

router.get('/dashboard-summary', auditLog('FETCH_WOREDA_SUMMARY'), getWoredaSummary);
router.get('/detail-list', auditLog('FETCH_WOREDA_DETAIL_LIST'), getWoredaDetailList);
router.get('/adjustment-table', auditLog('FETCH_WOREDA_ADJUSTMENT_TABLE'), getWoredaAdjustmentTable);
router.post('/lock', auditLog('WOREDA_LOCK_DEMAND'), woredaLock);
router.post('/adjust', auditLog('WOREDA_ADJUST_DEMAND'), woredaAdjust);

export default router;
