import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { getFlags, getSystemDates } from '../controllers/system.controller.js';

const router = express.Router();

router.get('/flags', getFlags);

router.use(protect);
router.use(authorizeRole(['SUPER_ADMIN']));

router.get('/dates', getSystemDates);

export default router;
