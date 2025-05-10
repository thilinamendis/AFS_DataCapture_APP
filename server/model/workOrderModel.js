import mongoose from 'mongoose';

const workOrderSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    customerName: {
        type: String,
        required: true
    },
    customerContact: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

export default WorkOrder; 