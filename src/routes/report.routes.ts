import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getRegionalAllocationReport,
  getUnionStockReport,
  getSoldFertilizerReport,
  getRevenueReport,
  exportToGoogleSheets
} from '../controllers/report.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRole(['MOA_MANAGER', 'SUPER_ADMIN', 'REGION_MANAGER']));

router.get('/regional-allocation', auditLog('FETCH_REGIONAL_ALLOCATION_REPORT'), getRegionalAllocationReport);
router.get('/union-stock', auditLog('FETCH_UNION_STOCK_REPORT'), getUnionStockReport);
router.get('/sold-fertilizer', auditLog('FETCH_SOLD_FERTILIZER_REPORT'), getSoldFertilizerReport);
router.get('/revenue', auditLog('FETCH_REVENUE_REPORT'), getRevenueReport);
router.post('/export/google-sheets', auditLog('EXPORT_GOOGLE_SHEETS'), exportToGoogleSheets);

export default router;
