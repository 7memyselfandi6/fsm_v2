import express from 'express';
// 1. All local file imports MUST end in .js
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getSeasons,
  getCropCategories,
  getFertilizerTypes,
  submitFarmerDemand,
  adjustFarmerDemand,
  getDashboardSummary,
  getDetailList,
  updateDemand,
  deleteDemand,
} from '../controllers/demand.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

// Submit demand (Public - no auth required)
router.post(
  '/',
  auditLog('CREATE_DEMAND'),
  submitFarmerDemand
);

router.use(protect);

router.get('/seasons', getSeasons);
router.get('/crops', getCropCategories);
router.get('/fertilizers', getFertilizerTypes);

// Dashboards
router.get('/dashboard-summary', auditLog('FETCH_DEMAND_DASHBOARD'), getDashboardSummary);
router.get('/detail-list', auditLog('FETCH_DEMAND_LIST'), getDetailList);

// Adjust demand (Multi-level Approved quantity)
router.put(
  '/:id/adjust',
  auditLog('ADJUST_DEMAND'),
  authorizeRole([
    'KEBELE_MANAGER',
    'WOREDA_EXPERT',
    'WOREDA_MANAGER',
    'ZONE_EXPERT',
    'ZONE_MANAGER',
    'REGION_EXPERT',
    'REGION_MANAGER',
    'MOA_EXPERT',
    'MOA_MANAGER',
    'SUPER_ADMIN',
  ]),
  adjustFarmerDemand
);

// Row Actions (Edit/Delete)
router.put('/:id', auditLog('EDIT_DEMAND'), updateDemand);
router.delete('/:id', auditLog('DELETE_DEMAND'), deleteDemand);

export default router;

