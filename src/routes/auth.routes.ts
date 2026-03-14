import express from 'express';
import { authUser, register } from '../controllers/auth.controller.js';
import { protect, authorizeRole } from '../middlewares/auth.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Route for creating a new member account - Only Super Admin
router.post(
  '/register',
  protect,
  authorizeRole(['SUPER_ADMIN']),
  upload.single('profilePicture'),
  register
);

// Route for logging in to get a JWT token
router.post('/login', authUser);

export default router;
