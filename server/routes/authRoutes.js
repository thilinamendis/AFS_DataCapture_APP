import express from 'express';
import { login, registerUser, getUser, updateUser, deleteUser, getUsers, createUserByAdmin, getUserById, updateUserByAdmin, deleteUserByAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//Public routes
router.post('/register', registerUser);
router.post('/login', login);

//protected routes
router.get('/me', protect, getUser);
router.put('/update', protect, updateUser);
router.delete('/delete', protect, deleteUser);

//User management routes
router.route('/users')
    .get(protect, getUsers)
    .post(protect, createUserByAdmin);

router.route('/users/:id')
    .get(protect, getUserById)
    .put(protect, updateUserByAdmin)
    .delete(protect, deleteUserByAdmin);

export default router;
