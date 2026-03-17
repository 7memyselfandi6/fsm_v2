import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getFederalDashboard,
  getMasterData,
  getFederalFarmerRequests,
  postFederalAdjust
} from '../controllers/federal.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['MOA_MANAGER', 'MOA_EXPERT', 'SUPER_ADMIN']));

router.get('/dashboard', auditLog('FETCH_FEDERAL_DASHBOARD'), getFederalDashboard);
router.get('/master-data', auditLog('FETCH_MASTER_DATA'), getMasterData);
router.post('/adjust', auditLog('SUBMIT_FEDERAL_ADJUSTMENT'), postFederalAdjust);
router.get('/farmer-requests', auditLog('FETCH_FEDERAL_FARMER_REQUESTS'), getFederalFarmerRequests);

export default router;
