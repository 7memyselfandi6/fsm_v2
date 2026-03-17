import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getSubsidyReports,
  createSubsidyRecord,
  getCropFertilizerRates,
  updateCropFertilizerRate,
  toggleRateLock
} from '../controllers/subsidy.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

// Subsidy Reports (All managers can view)
router.get('/reports', auditLog('FETCH_SUBSIDY_REPORTS'), getSubsidyReports);

// Subsidy Record Management (Federal-only)
router.post('/records', authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN']), auditLog('CREATE_SUBSIDY_RECORD'), createSubsidyRecord);

// Crop Fertilizer Rates (Federal-only)
router.get('/crop-rates', auditLog('FETCH_CROP_FERTILIZER_RATES'), getCropFertilizerRates);
router.put('/crop-rates/:id', authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN']), auditLog('UPDATE_CROP_FERTILIZER_RATE'), updateCropFertilizerRate);
router.patch('/crop-rates/:id/lock', authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN']), auditLog('TOGGLE_CROP_FERTILIZER_RATE_LOCK'), toggleRateLock);

export default router;
