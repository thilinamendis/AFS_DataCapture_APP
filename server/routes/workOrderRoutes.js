import express from 'express';
import {
    createWorkOrder,
    getWorkOrders,
    getWorkOrderById,
    updateWorkOrder,
    deleteWorkOrder
} from '../controllers/workOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createWorkOrder)
    .get(protect, getWorkOrders);

router.route('/:id')
    .get(protect, getWorkOrderById)
    .put(protect, updateWorkOrder)
    .delete(protect, deleteWorkOrder);

export default router; 