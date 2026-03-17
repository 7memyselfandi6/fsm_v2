import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouse.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

router.get('/', auditLog('FETCH_WAREHOUSES'), getWarehouses);
router.get('/:id', auditLog('FETCH_WAREHOUSE_BY_ID'), getWarehouseById);

// Admin-only write operations
router.post('/', authorizeRole(['SUPER_ADMIN', 'MOA_MANAGER', 'REGION_MANAGER']), auditLog('CREATE_WAREHOUSE'), createWarehouse);
router.put('/:id', authorizeRole(['SUPER_ADMIN', 'MOA_MANAGER', 'REGION_MANAGER']), auditLog('UPDATE_WAREHOUSE'), updateWarehouse);
router.delete('/:id', authorizeRole(['SUPER_ADMIN', 'MOA_MANAGER', 'REGION_MANAGER']), auditLog('DELETE_WAREHOUSE'), deleteWarehouse);

export default router;
