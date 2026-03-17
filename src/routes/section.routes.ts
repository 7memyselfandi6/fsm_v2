import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/section.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

router.get('/', auditLog('FETCH_SECTIONS'), getSections);
router.get('/:id', auditLog('FETCH_SECTION_BY_ID'), getSectionById);

// Admin-only write operations
router.post('/', authorizeRole(['SUPER_ADMIN']), auditLog('CREATE_SECTION'), createSection);
router.put('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('UPDATE_SECTION'), updateSection);
router.delete('/:id', authorizeRole(['SUPER_ADMIN']), auditLog('DELETE_SECTION'), deleteSection);

export default router;
