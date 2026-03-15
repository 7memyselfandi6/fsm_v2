import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { getCrops, createCrop, updateCrop } from '../controllers/crop.controller.js';

const router = express.Router();

router.get('/', getCrops);

router.use(protect);
router.use(authorizeRole(['SUPER_ADMIN']));

router.post('/', createCrop);
router.put('/:id', updateCrop);

export default router;
