import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import * as requirementController from '../controllers/requirement.controller.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Requirement Routes
router.post('/', requirementController.createRequirement);
router.get('/', requirementController.getRequirements);
router.get('/:uniqueFarmerId', requirementController.getRequirementById);
router.put('/:uniqueFarmerId', requirementController.updateRequirement);
router.delete('/:uniqueFarmerId', requirementController.deleteRequirement);

export default router;
