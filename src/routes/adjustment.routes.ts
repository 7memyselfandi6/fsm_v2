import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import * as adjustmentController from '../controllers/adjustment.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

// Federal Level Adjustments
router.post('/federal', authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN']), auditLog('FEDERAL_ADJUSTMENT'), adjustmentController.adjustFederal);
router.post('/toggle-lock', authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN']), auditLog('TOGGLE_GLOBAL_LOCK'), adjustmentController.toggleGlobalLock);
router.get('/federal', adjustmentController.getFederalAdjustment);

// Regional Level Adjustments
router.post('/region', authorizeRole(['REGION_MANAGER', 'SUPER_ADMIN']), auditLog('REGION_ADJUSTMENT'), adjustmentController.adjustRegion);
router.get('/region', adjustmentController.getRegionAdjustment);

// Zone Level Adjustments
router.post('/zone', authorizeRole(['ZONE_MANAGER', 'SUPER_ADMIN']), auditLog('ZONE_ADJUSTMENT'), adjustmentController.adjustZone);
router.get('/zone', adjustmentController.getZoneAdjustment);

// Woreda Level Adjustments
router.post('/woreda', authorizeRole(['WOREDA_MANAGER', 'SUPER_ADMIN']), auditLog('WOREDA_ADJUSTMENT'), adjustmentController.adjustWoreda);
router.get('/woreda', adjustmentController.getWoredaAdjustment);

// Kebele Status (Read-only)
router.get('/kebele', adjustmentController.getKebeleAdjustment);

export default router;
