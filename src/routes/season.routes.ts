import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { getSeasons, createSeason, updateSeason } from '../controllers/season.controller.js';

const router = express.Router();

router.get('/', getSeasons);

router.use(protect);
router.use(authorizeRole(['SUPER_ADMIN']));

router.post('/', createSeason);
router.put('/:id', updateSeason);

export default router;
