import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getZoneSummary,
  getZoneDetailList,
  getZoneAdjustmentTable,
  zoneLock,
  zoneAdjust
} from '../controllers/zone.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']));

router.get('/dashboard-summary', auditLog('FETCH_ZONE_SUMMARY'), getZoneSummary);
router.get('/detail-list', auditLog('FETCH_ZONE_DETAIL_LIST'), getZoneDetailList);
router.get('/adjustment-table', auditLog('FETCH_ZONE_ADJUSTMENT_TABLE'), getZoneAdjustmentTable);
router.post('/lock', auditLog('ZONE_LOCK_DEMAND'), zoneLock);
router.post('/adjust', auditLog('ZONE_ADJUST_DEMAND'), zoneAdjust);

export default router;
