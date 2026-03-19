import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/hierarchicalDemand.controller.js';

const router = express.Router();

// Federal
router.get('/federal', protect, controller.getFederalSummary);
router.get('/federal/:fertilizerType', protect, controller.getFederalDrillDown);

// Region
router.get('/region/:regionId', protect, controller.getRegionSummary);
router.get('/region/:regionId/:fertilizerType', protect, controller.getRegionDrillDown);

// Zone
router.get('/zone/:zoneId', protect, controller.getZoneSummary);
router.get('/zone/:zoneId/:fertilizerType', protect, controller.getZoneDrillDown);

// Woreda
router.get('/woreda/:woredaId', protect, controller.getWoredaSummary);
router.get('/woreda/:woredaId/:fertilizerType', protect, controller.getWoredaDrillDown);

export default router;
