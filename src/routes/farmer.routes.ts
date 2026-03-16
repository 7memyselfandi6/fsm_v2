import express from 'express';
import type { Router } from 'express'; // Use 'import type' for interfaces
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { upload } from '../config/cloudinary.js';
import {
  registerFarmer,
  getFarmerById,
  getFarmersByKebele,
  updateFarmer,
  getFarmerIdByPhone,
  deleteFarmer,
} from '../controllers/farmer.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  auditLog('REGISTER_FARMER'),
  authorizeRole(['KEBELE_DA', 'KEBELE_MANAGER', 'SUPER_ADMIN']),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'landCertificate', maxCount: 1 },
  ]),
  registerFarmer
);

// Search farmer by unique ID - All authenticated users
router.get('/search/:uniqueFarmerId', auditLog('SEARCH_FARMER'), getFarmerById);

router.get('/lookup/:phoneNumber', auditLog('LOOKUP_FARMER_ID'), getFarmerIdByPhone);
router.get('/:uniqueFarmerId', auditLog('GET_FARMER_BY_ID'), getFarmerById);
router.get('/kebele/:kebeleId', auditLog('GET_FARMERS_BY_KEBELE'), getFarmersByKebele);

// Restricted to SUPER_ADMIN
router.put('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('UPDATE_FARMER'), updateFarmer);
router.delete('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('DELETE_FARMER'), deleteFarmer);

export default router;
