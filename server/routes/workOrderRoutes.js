import express from 'express';
import {
    createWorkOrder,
    getWorkOrders,
    getWorkOrderById,
    updateWorkOrder,
    deleteWorkOrder,
    getWorkOrdersByStatus,
    searchWorkOrders,
    downloadWorkOrderPDF
} from '../controllers/workOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route('/')
    .get(getWorkOrders)
    .post(authorize('admin', 'manager'), createWorkOrder);

router.route('/search')
    .get(searchWorkOrders);

router.route('/status/:status')
    .get(getWorkOrdersByStatus);

router.route('/:id')
    .get(getWorkOrderById)
    .put(authorize('admin', 'manager'), updateWorkOrder)
    .delete(authorize('admin'), deleteWorkOrder);

router.get('/:id/pdf', downloadWorkOrderPDF);

export default router; 