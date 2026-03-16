import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { getFlags, getSystemDates, getInitDemandFormData } from '../controllers/system.controller.js';

const router = express.Router();

router.get('/flags', getFlags);

router.use(protect);

// Endpoint for frontend to initialize demand form (available to all authenticated users)
router.get('/init-demand-form', getInitDemandFormData);

router.use(authorizeRole(['SUPER_ADMIN']));


router.get('/dates', getSystemDates);

export default router;
