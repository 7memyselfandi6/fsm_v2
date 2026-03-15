import express from 'express';
// 1. All local file imports MUST end in .js
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getSeasons,
  getCropCategories,
  getFertilizerTypes,
  submitFarmerDemand,
  adjustFarmerDemand,
  lockDemands,
  getDemandDashboard,
} from '../controllers/demand.controller.js';


const router = express.Router();

router.use(protect);

router.get('/seasons', getSeasons);
router.get('/crops', getCropCategories);
router.get('/fertilizers', getFertilizerTypes);

// Submit demand (DA)
router.post(
  '/',
  authorizeRole(['KEBELE_DA', 'KEBELE_MANAGER', 'SUPER_ADMIN']),
  submitFarmerDemand
);

// Adjust demand (Multi-level)
router.put(
  '/:id/adjust',
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

// Lock demands
router.put(
  '/lock',
  authorizeRole([
    'KEBELE_MANAGER',
    'WOREDA_MANAGER',
    'ZONE_MANAGER',
    'REGION_MANAGER',
    'MOA_MANAGER',
    'SUPER_ADMIN',
  ]),
  lockDemands
);

// Dashboard
router.get('/dashboard', getDemandDashboard);

export default router;
