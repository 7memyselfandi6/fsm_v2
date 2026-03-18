
import express from 'express';
import {
  getKebeleFinancials,
  getWoredaFinancials,
  getZoneFinancials,
  getRegionFinancials,
  getFederalFinancials
} from '../controllers/financial.controller.js';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/kebele').get(protect, authorizeRole(['KEBELE_MANAGER']), getKebeleFinancials);
router.route('/woreda').get(protect, authorizeRole(['WOREDA_MANAGER']), getWoredaFinancials);
router.route('/zone').get(protect, authorizeRole(['ZONE_MANAGER']), getZoneFinancials);
router.route('/region').get(protect, authorizeRole(['REGION_MANAGER']), getRegionFinancials);
router.route('/federal').get(protect, authorizeRole(['MOA_MANAGER']), getFederalFinancials);

export default router;
