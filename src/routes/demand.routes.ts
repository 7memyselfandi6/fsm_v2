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
  getWoredaSummary,
  getWoredaDetailList,
  getWoredaAdjustmentTable,
  woredaAdjust,
  getZoneSummary,
  getZoneAdjustmentTable,
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

// Woreda Module
router.get(
  '/woreda-summary',
  auditLog('FETCH_WOREDA_SUMMARY'),
  authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  getWoredaSummary
);
router.get(
  '/woreda-detail-list',
  auditLog('FETCH_WOREDA_DETAIL_LIST'),
  authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  getWoredaDetailList
);
router.get(
  '/woreda-adjustment-table',
  auditLog('FETCH_WOREDA_ADJUSTMENT_TABLE'),
  authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  getWoredaAdjustmentTable
);
router.patch(
  '/woreda-adjust',
  auditLog('WOREDA_ADJUST_DEMAND'),
  authorizeRole(['WOREDA_MANAGER', 'ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  woredaAdjust
);

// Zone Module
router.get(
  '/zone-summary',
  auditLog('FETCH_ZONE_SUMMARY'),
  authorizeRole(['ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  getZoneSummary
);
router.get(
  '/zone-adjustment-table',
  auditLog('FETCH_ZONE_ADJUSTMENT_TABLE'),
  authorizeRole(['ZONE_MANAGER', 'REGION_MANAGER', 'SUPER_ADMIN']),
  getZoneAdjustmentTable
);

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

