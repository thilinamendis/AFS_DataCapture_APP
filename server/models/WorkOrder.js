import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    assignedTo: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerContact: {
        type: String,
        trim: true
    },
    // Confined Space Survey Fields
    dateOfSurvey: {
        type: Date,
        required: true
    },
    surveyors: {
        type: String,
        required: true,
        trim: true
    },
    confinedSpaceName: {
        type: String,
        required: true,
        trim: true
    },
    building: {
        type: String,
        required: true,
        trim: true
    },
    locationDescription: {
        type: String,
        required: true,
        trim: true
    },
    confinedSpaceDescription: {
        type: String,
        trim: true
    },
    isConfinedSpace: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    isPermitRequired: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    entryRequirements: {
        type: String,
        trim: true
    },
    hasAtmosphericHazard: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    atmosphericHazardDescription: {
        type: String,
        trim: true
    },
    hasEngulfmentHazard: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    engulfmentHazardDescription: {
        type: String,
        trim: true
    },
    hasConfigurationHazard: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    configurationHazardDescription: {
        type: String,
        trim: true
    },
    hasOtherHazards: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    otherHazardsDescription: {
        type: String,
        trim: true
    },
    requiresPPE: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    ppeList: {
        type: String,
        trim: true
    },
    isForcedAirVentilationSufficient: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    hasDedicatedAirMonitor: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    hasWarningSign: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    hasOtherPeopleWorking: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    canOthersSeeIntoSpace: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    doContractorsEnter: {
        type: String,
        enum: ['Y', 'N'],
        default: 'N'
    },
    numberOfEntryPoints: {
        type: Number,
        min: 0
    },
    notes: {
        type: String,
        trim: true
    },
    pictures: [{
        type: String // URLs to stored images
    }],
    pdfPath: {
        type: String // Path to generated PDF
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);

export default WorkOrder; 