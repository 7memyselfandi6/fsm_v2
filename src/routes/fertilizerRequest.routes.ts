import { Router } from 'express';
import {
  getKebeleRequestsController,
  getWoredaRequestsController,
  getZoneRequestsController,
  getRegionRequestsController,
  getFederalRequestsController,
} from '../controllers/fertilizerRequest.controller.js';
// import { protect } from '../middleware/authMiddleware'; // Assuming an auth middleware

const router = Router();

// All routes are assumed to be protected in a real application
// router.use(protect); 

router.get('/kebele/:fertilizer_type_id', getKebeleRequestsController);
router.get('/woreda/:fertilizer_type_id', getWoredaRequestsController);
router.get('/zone/:fertilizer_type_id', getZoneRequestsController);
router.get('/region/:fertilizer_type_id', getRegionRequestsController);
router.get('/federal/:fertilizer_type_id', getFederalRequestsController);

export default router;