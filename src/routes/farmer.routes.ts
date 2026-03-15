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
} from '../controllers/farmer.controller.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorizeRole(['KEBELE_DA', 'KEBELE_MANAGER', 'SUPER_ADMIN']),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'landCertificate', maxCount: 1 },
  ]),
  registerFarmer
);

router.get('/lookup/:phoneNumber', getFarmerIdByPhone);
router.get('/:uniqueFarmerId', getFarmerById);
router.get('/kebele/:kebeleId', getFarmersByKebele);
router.put('/:id', updateFarmer);

export default router;
