import WorkOrder from "../model/workOrderModel.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new work order
// @route   POST /api/workorders
// @access  Private
export const createWorkOrder = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        priority,
        status,
        customerName,
        customerContact,
        location,
        dueDate,
        assignedTo
    } = req.body;

    const workOrder = await WorkOrder.create({
        title,
        description,
        priority,
        status,
        customerName,
        customerContact,
        location,
        dueDate,
        assignedTo,
        createdBy: req.user._id
    });

    if (workOrder) {
        res.status(201).json(workOrder);
    } else {
        res.status(400).json({ message: "Invalid work order data" });
    }
});

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private
export const getWorkOrders = asyncHandler(async (req, res) => {
    const workOrders = await WorkOrder.find({})
        .populate('assignedTo', 'firstname lastname')
        .populate('createdBy', 'firstname lastname');
    res.json(workOrders);
});

// @desc    Get work order by ID
// @route   GET /api/workorders/:id
// @access  Private
export const getWorkOrderById = asyncHandler(async (req, res) => {
    const workOrder = await WorkOrder.findById(req.params.id)
        .populate('assignedTo', 'firstname lastname')
        .populate('createdBy', 'firstname lastname');

    if (workOrder) {
        res.json(workOrder);
    } else {
        res.status(404).json({ message: "Work order not found" });
    }
});

// @desc    Update work order
// @route   PUT /api/workorders/:id
// @access  Private
export const updateWorkOrder = asyncHandler(async (req, res) => {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (workOrder) {
        workOrder.title = req.body.title || workOrder.title;
        workOrder.description = req.body.description || workOrder.description;
        workOrder.priority = req.body.priority || workOrder.priority;
        workOrder.status = req.body.status || workOrder.status;
        workOrder.customerName = req.body.customerName || workOrder.customerName;
        workOrder.customerContact = req.body.customerContact || workOrder.customerContact;
        workOrder.location = req.body.location || workOrder.location;
        workOrder.dueDate = req.body.dueDate || workOrder.dueDate;
        workOrder.assignedTo = req.body.assignedTo || workOrder.assignedTo;

        const updatedWorkOrder = await workOrder.save();
        res.json(updatedWorkOrder);
    } else {
        res.status(404).json({ message: "Work order not found" });
    }
});

// @desc    Delete work order
// @route   DELETE /api/workorders/:id
// @access  Private
export const deleteWorkOrder = asyncHandler(async (req, res) => {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (workOrder) {
        await workOrder.deleteOne();
        res.json({ message: "Work order removed" });
    } else {
        res.status(404).json({ message: "Work order not found" });
    }
}); 