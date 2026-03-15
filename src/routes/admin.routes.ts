import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  createRegion,
  createZone,
  createWoreda,
  createKebele,
  createUnion,
  createDestination,
  createPC,
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes in this file are restricted to SUPER_ADMIN
router.use(protect);
router.use(authorizeRole(['SUPER_ADMIN']));

// Geographic Hierarchy
router.post('/regions', createRegion);
router.post('/zones', createZone);
router.post('/woredas', createWoreda);
router.post('/kebeles', createKebele);

// Organizational Entities
router.post('/unions', createUnion);
router.post('/destinations', createDestination);
router.post('/pcs', createPC);

export default router;
