import express from 'express';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import {
  getShippingLots,
  getUnions,
  getDestinations,
  getPCs,
  getPCInventory,
  initiateSale,
  deliverSale,
  getSalesByPC,
} from '../controllers/supply.controller.js';

const router = express.Router();

router.use(protect);

// Shipping Lots
router.get('/lots', getShippingLots);

// Unions & Destinations
router.get('/unions', getUnions);
router.get('/destinations', getDestinations);

// PCs
router.get('/pcs', getPCs);

// Inventory
router.get('/inventory/:pcId', getPCInventory);

// Sales (Accountant)
router.post(
  '/sales/initiate',
  authorizeRole(['PC_ACCOUNTANT', 'SUPER_ADMIN']),
  initiateSale
);

// Delivery (Storeman)
router.put(
  '/sales/:id/deliver',
  authorizeRole(['PC_STOREMAN', 'SUPER_ADMIN']),
  deliverSale
);

// Get sales
router.get('/sales/pc/:pcId', getSalesByPC);

export default router;
