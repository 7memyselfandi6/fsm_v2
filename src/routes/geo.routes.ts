import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getRegions,
  getZones,
  getWoredas,
  getKebeles,
} from '../controllers/geo.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

router.get('/regions', authorizeRole(['SUPER_ADMIN']), auditLog('FETCH_REGIONS'), getRegions);
router.get('/zones', auditLog('FETCH_ZONES'), getZones);
router.get('/woredas', auditLog('FETCH_WOREDAS'), getWoredas);
router.get('/kebeles', auditLog('FETCH_KEBELES'), getKebeles);

export default router;
