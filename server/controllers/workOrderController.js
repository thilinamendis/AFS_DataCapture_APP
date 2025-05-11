import WorkOrder from "../models/WorkOrder.js";
import asyncHandler from "express-async-handler";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/workorders';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).array('pictures', 5); // Allow up to 5 pictures

// Generate PDF for work order
const generatePDF = async (workOrder) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const pdfPath = `uploads/workorders/${workOrder._id}.pdf`;
            
            // Create write stream
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Add content to PDF
            doc.fontSize(20).text('Work Order Details', { align: 'center' });
            doc.moveDown();

            // Basic Information
            doc.fontSize(16).text('Basic Information');
            doc.fontSize(12)
                .text(`Title: ${workOrder.title}`)
                .text(`Description: ${workOrder.description}`)
                .text(`Priority: ${workOrder.priority}`)
                .text(`Status: ${workOrder.status}`)
                .text(`Due Date: ${new Date(workOrder.dueDate).toLocaleDateString()}`)
                .text(`Location: ${workOrder.location}`)
                .text(`Customer Name: ${workOrder.customerName}`)
                .text(`Customer Contact: ${workOrder.customerContact}`);
            doc.moveDown();

            // Survey Information
            doc.fontSize(16).text('Survey Information');
            doc.fontSize(12)
                .text(`Date of Survey: ${new Date(workOrder.dateOfSurvey).toLocaleDateString()}`)
                .text(`Surveyors: ${workOrder.surveyors}`)
                .text(`Confined Space Name/ID: ${workOrder.confinedSpaceName}`)
                .text(`Building: ${workOrder.building}`)
                .text(`Location Description: ${workOrder.locationDescription}`);
            doc.moveDown();

            // Confined Space Assessment
            doc.fontSize(16).text('Confined Space Assessment');
            doc.fontSize(12)
                .text(`Is Confined Space: ${workOrder.isConfinedSpace}`)
                .text(`Permit Required: ${workOrder.isPermitRequired}`)
                .text(`Entry Requirements: ${workOrder.entryRequirements || 'N/A'}`);
            doc.moveDown();

            // Hazards Assessment
            doc.fontSize(16).text('Hazards Assessment');
            doc.fontSize(12)
                .text(`Atmospheric Hazard: ${workOrder.hasAtmosphericHazard}`)
                .text(`Atmospheric Hazard Description: ${workOrder.atmosphericHazardDescription || 'N/A'}`)
                .text(`Engulfment Hazard: ${workOrder.hasEngulfmentHazard}`)
                .text(`Engulfment Hazard Description: ${workOrder.engulfmentHazardDescription || 'N/A'}`)
                .text(`Configuration Hazard: ${workOrder.hasConfigurationHazard}`)
                .text(`Configuration Hazard Description: ${workOrder.configurationHazardDescription || 'N/A'}`)
                .text(`Other Hazards: ${workOrder.hasOtherHazards}`)
                .text(`Other Hazards Description: ${workOrder.otherHazardsDescription || 'N/A'}`);
            doc.moveDown();

            // Safety Requirements
            doc.fontSize(16).text('Safety Requirements');
            doc.fontSize(12)
                .text(`PPE Required: ${workOrder.requiresPPE}`)
                .text(`PPE List: ${workOrder.ppeList || 'N/A'}`)
                .text(`Forced Air Ventilation Sufficient: ${workOrder.isForcedAirVentilationSufficient}`)
                .text(`Dedicated Air Monitor: ${workOrder.hasDedicatedAirMonitor}`)
                .text(`Warning Sign Posted: ${workOrder.hasWarningSign}`);
            doc.moveDown();

            // Additional Information
            doc.fontSize(16).text('Additional Information');
            doc.fontSize(12)
                .text(`Other People Working: ${workOrder.hasOtherPeopleWorking}`)
                .text(`Can Others See into Space: ${workOrder.canOthersSeeIntoSpace}`)
                .text(`Do Contractors Enter: ${workOrder.doContractorsEnter}`)
                .text(`Number of Entry Points: ${workOrder.numberOfEntryPoints || 'N/A'}`)
                .text(`Notes: ${workOrder.notes || 'N/A'}`);

            // Add pictures if they exist
            if (workOrder.pictures && workOrder.pictures.length > 0) {
                doc.moveDown();
                doc.fontSize(16).text('Attached Pictures');
                workOrder.pictures.forEach((pictureUrl, index) => {
                    doc.text(`Picture ${index + 1}: ${pictureUrl}`);
                    doc.moveDown();
                });
            }

            // Finalize PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve(pdfPath);
            });

            writeStream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// @desc    Create a new work order
// @route   POST /api/workorders
// @access  Private
export const createWorkOrder = asyncHandler(async (req, res) => {
    try {
        const workOrderData = {
            ...req.body,
            createdBy: req.user._id,
            pictures: req.body.pictures || [] // Array of Firebase Storage URLs
        };

        const workOrder = await WorkOrder.create(workOrderData);

        // Generate PDF
        try {
            const pdfPath = await generatePDF(workOrder);
            workOrder.pdfPath = pdfPath;
            await workOrder.save();
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
        }

        res.status(201).json({
            success: true,
            data: workOrder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Download work order PDF
// @route   GET /api/workorders/:id/pdf
// @access  Private
export const downloadWorkOrderPDF = asyncHandler(async (req, res) => {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
        return res.status(404).json({
            success: false,
            message: 'Work order not found'
        });
    }

    if (!workOrder.pdfPath || !fs.existsSync(workOrder.pdfPath)) {
        // Generate PDF if it doesn't exist
        try {
            const pdfPath = await generatePDF(workOrder);
            workOrder.pdfPath = pdfPath;
            await workOrder.save();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error generating PDF'
            });
        }
    }

    res.download(workOrder.pdfPath, `work-order-${workOrder._id}.pdf`);
});

// @desc    Get all work orders
// @route   GET /api/workorders
// @access  Private
export const getWorkOrders = asyncHandler(async (req, res) => {
    try {
        const workOrders = await WorkOrder.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: workOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get work order by ID
// @route   GET /api/workorders/:id
// @access  Private
export const getWorkOrderById = asyncHandler(async (req, res) => {
    const workOrder = await WorkOrder.findById(req.params.id)
        .populate('createdBy', 'name email');

    if (workOrder) {
        res.status(200).json({
            success: true,
            data: workOrder
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Work order not found'
        });
    }
});

// @desc    Update work order
// @route   PUT /api/workorders/:id
// @access  Private
export const updateWorkOrder = asyncHandler(async (req, res) => {
    try {
        const workOrderData = {
            ...req.body,
            updatedAt: Date.now()
        };

        const workOrder = await WorkOrder.findByIdAndUpdate(
            req.params.id,
            workOrderData,
            { new: true, runValidators: true }
        );

        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: workOrder
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Delete work order
// @route   DELETE /api/workorders/:id
// @access  Private
export const deleteWorkOrder = asyncHandler(async (req, res) => {
    try {
        const workOrder = await WorkOrder.findById(req.params.id);

        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found'
            });
        }

        // Delete associated pictures
        if (workOrder.pictures) {
            workOrder.pictures.forEach(picture => {
                if (fs.existsSync(picture)) {
                    fs.unlinkSync(picture);
                }
            });
        }

        await workOrder.remove();

        res.status(200).json({
            success: true,
            message: 'Work order deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get work orders by status
export const getWorkOrdersByStatus = asyncHandler(async (req, res) => {
    try {
        const workOrders = await WorkOrder.find({ status: req.params.status })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: workOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Search work orders
export const searchWorkOrders = asyncHandler(async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const workOrders = await WorkOrder.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { customerName: { $regex: searchQuery, $options: 'i' } },
                { location: { $regex: searchQuery, $options: 'i' } },
                { confinedSpaceName: { $regex: searchQuery, $options: 'i' } }
            ]
        })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: workOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}); 