import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { getFertilizerTypes, createFertilizerType, searchFertilizer } from '../controllers/fertilizer.controller.js';

const router = express.Router();

router.get('/', getFertilizerTypes);
router.get('/search', searchFertilizer);

router.use(protect);
router.use(authorizeRole(['SUPER_ADMIN']));

router.post('/', createFertilizerType);

export default router;
