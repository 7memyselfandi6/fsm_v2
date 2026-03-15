import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getUsers, updateUser } from '../controllers/user.controller.js';
import { auditLog } from '../utils/auditLogger.js';

const router = express.Router();

router.use(protect);

router.get('/', auditLog('FETCH_USERS'), getUsers);
router.put('/:id', auditLog('UPDATE_USER'), updateUser);

export default router;
