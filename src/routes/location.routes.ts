import express from 'express';
import {
  getRegions,
  getZones,
  getWoredas,
  getKebeles,
} from '../controllers/location.controller.js';


const router = express.Router();

router.get('/regions', getRegions);
router.get('/zones/:regionId', getZones);
router.get('/woredas/:zoneId', getWoredas);
router.get('/kebeles/:woredaId', getKebeles);

export default router;
