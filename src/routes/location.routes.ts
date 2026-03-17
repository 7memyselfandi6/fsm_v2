import express from 'express';
import {
  getRegions,
  getZones,
  getWoredas,
  getKebeles,
  getSections,
  createKebele,
  updateKebele,
  deleteKebele,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/location.controller.js';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/regions', getRegions);
router.get('/zones/:regionId', getZones);
router.get('/woredas/:zoneId', getWoredas);
router.get('/kebeles/:woredaId', getKebeles);
router.get('/sections/:kebeleId', getSections);

// CRUD for Kebele and Section
router.post('/kebeles', protect, authorizeRole(['SUPER_ADMIN']), createKebele);
router.put('/kebeles/:id', protect, authorizeRole(['SUPER_ADMIN']), updateKebele);
router.delete('/kebeles/:id', protect, authorizeRole(['SUPER_ADMIN']), deleteKebele);

router.post('/sections', protect, authorizeRole(['SUPER_ADMIN']), createSection);
router.put('/sections/:id', protect, authorizeRole(['SUPER_ADMIN']), updateSection);
router.delete('/sections/:id', protect, authorizeRole(['SUPER_ADMIN']), deleteSection);

export default router;
