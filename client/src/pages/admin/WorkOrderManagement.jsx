import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
//import ModernImageIcon from '../../components/admin/ModernImageIcon';
import { FaImages } from "react-icons/fa6";
import { 
    EyeIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon,
    XCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PencilIcon,
    TrashIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';
import { uploadImages } from '../../utils/firebase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';



// Helper function to draw checkboxes
function drawCheckbox(doc, x, y, checked) {
    doc.rect(x, y, 4, 4);
    if (checked) {
        doc.line(x, y, x + 4, y + 4);
        doc.line(x + 4, y, x, y + 4);
    }
}

function WorkOrderManagement() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        assignedTo: '',
        dueDate: '',
        location: '',
        customerName: '',
        customerContact: '',
        dateOfSurvey: '',
        surveyors: '',
        confinedSpaceName: '',
        building: '',
        locationDescription: '',
        confinedSpaceDescription: '',
        isConfinedSpace: 'N',
        isPermitRequired: 'N',
        entryRequirements: '',
        hasAtmosphericHazard: 'N',
        atmosphericHazardDescription: '',
        hasEngulfmentHazard: 'N',
        engulfmentHazardDescription: '',
        hasConfigurationHazard: 'N',
        configurationHazardDescription: '',
        hasOtherHazards: 'N',
        otherHazardsDescription: '',
        requiresPPE: 'N',
        ppeList: '',
        isForcedAirVentilationSufficient: 'N',
        hasDedicatedAirMonitor: 'N',
        hasWarningSign: 'N',
        hasOtherPeopleWorking: 'N',
        canOthersSeeIntoSpace: 'N',
        doContractorsEnter: 'N',
        numberOfEntryPoints: '',
        notes: '',
        pictures: []
    });
    const [errors, setErrors] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWorkOrder, setEditingWorkOrder] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    console.log(workOrders);
    

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/workorders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkOrders(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error('Error fetching work orders:', error);
            setError('Failed to fetch work orders');
            setWorkOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkOrders = Array.isArray(workOrders) ? workOrders.filter(workOrder => {
        const statusMatch = filterStatus === 'all' || workOrder.status === filterStatus;
        const searchMatch = `${workOrder.title} ${workOrder.customerName} ${workOrder.location}`.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return statusMatch && searchMatch;
    }) : [];

    const handleViewWorkOrder = (workOrder) => {
        setSelectedWorkOrder(workOrder);
        setIsModalOpen(true);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.dateOfSurvey) newErrors.dateOfSurvey = 'Date of Survey is required';
        if (!formData.surveyors.trim()) newErrors.surveyors = 'Surveyor(s) is required';
        if (!formData.confinedSpaceName.trim()) newErrors.confinedSpaceName = 'Confined Space Name/ID is required';
        if (!formData.building.trim()) newErrors.building = 'Building is required';
        if (!formData.locationDescription.trim()) newErrors.locationDescription = 'Location Description is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateWorkOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Error',
                    text: 'Please log in to create a work order',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                return;
            }

            // Upload images to Firebase Storage if there are any
            let pictureUrls = [];
            if (formData.pictures && formData.pictures.length > 0) {
                try {
                    pictureUrls = await uploadImages(formData.pictures);
                } catch (error) {
                    console.error('Error uploading images:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        text: 'Failed to upload images. Please try again.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    return;
                }
            }

            // Create the work order data without the File objects
            const workOrderData = {
                ...formData,
                pictures: pictureUrls // Replace File objects with URLs
            };

            const response = await axios.post('http://localhost:5000/api/workorders', workOrderData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Work Order Created',
                    text: 'New work order has been created successfully',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

                setIsCreateModalOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: 'pending',
                    assignedTo: '',
                    dueDate: '',
                    location: '',
                    customerName: '',
                    customerContact: '',
                    dateOfSurvey: '',
                    surveyors: '',
                    confinedSpaceName: '',
                    building: '',
                    locationDescription: '',
                    confinedSpaceDescription: '',
                    isConfinedSpace: 'N',
                    isPermitRequired: 'N',
                    entryRequirements: '',
                    hasAtmosphericHazard: 'N',
                    atmosphericHazardDescription: '',
                    hasEngulfmentHazard: 'N',
                    engulfmentHazardDescription: '',
                    hasConfigurationHazard: 'N',
                    configurationHazardDescription: '',
                    hasOtherHazards: 'N',
                    otherHazardsDescription: '',
                    requiresPPE: 'N',
                    ppeList: '',
                    isForcedAirVentilationSufficient: 'N',
                    hasDedicatedAirMonitor: 'N',
                    hasWarningSign: 'N',
                    hasOtherPeopleWorking: 'N',
                    canOthersSeeIntoSpace: 'N',
                    doContractorsEnter: 'N',
                    numberOfEntryPoints: '',
                    notes: '',
                    pictures: []
                });
                setErrors({});
                fetchWorkOrders();
            }
        } catch (error) {
            console.error('Error creating work order:', error);
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create work order',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };



// Update PDF download handler
const handleDownloadPDF = (workOrder) => {
    try {
        console.log('Starting PDF generation for work order:', workOrder);
        
        const doc = new jsPDF();
        console.log('PDF document created');
        
        let totalPages = 0;
        let currentPage = 1;
        
        // Define colors
        const primaryColor = [41, 128, 185]; // Blue
        const secondaryColor = [44, 62, 80]; // Dark blue/gray
        const lightGrayBg = [245, 245, 245]; // Light gray for backgrounds
        
        // Function to add a footer with dynamic page numbers
        const addFooter = () => {
            const pageInfo = `Page ${currentPage} of ${totalPages}`;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(pageInfo, 105, 287, { align: 'center' });
            
            // Add footer line
            doc.setDrawColor(...secondaryColor);
            doc.setLineWidth(0.5);
            doc.line(20, 282, 190, 282);
        };
        
        // Function to check if we need a new page based on vertical position
        const checkForNewPage = (yPos, neededSpace = 10) => {
            if (yPos + neededSpace > 270) {
                doc.addPage();
                currentPage++;
                return 20; // Reset y position to top of new page
            }
            return yPos;
        };
        
        console.log('Adding header');
        // Add stylish header
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text('CONFINED SPACE EVALUATION FORM', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
        
        // Add form metadata
        let yPos = 40;
        
        console.log('Adding work order information');
        // Add work order title box
        doc.setFillColor(...lightGrayBg);
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, yPos - 7, 170, 14, 2, 2, 'FD');
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.setFontSize(12);
        doc.text(`Work Order: ${workOrder._id || '[No ID]'} - ${workOrder.title || '[No Title]'}`, 25, yPos);
        yPos += 15;

        // Create two columns for metadata
        const leftColumn = [
            { label: 'Status', value: workOrder.status || 'Not Set' },
            { label: 'Priority', value: workOrder.priority || 'Not Assigned' },
            { label: 'Customer Name', value: workOrder.customerName || 'No Customer Information' },
            { label: 'Customer Contact', value: workOrder.customerContact || 'No Contact Information' },
            { label: 'Location', value: workOrder.location || 'Location Not Specified' },
            { label: 'Building', value: workOrder.building || 'Building Not Specified' },
            { label: 'Confined Space Name/ID', value: workOrder.confinedSpaceName || 'Not Identified' }
        ];
        
        const rightColumn = [
            { label: 'Due Date', value: workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'No Due Date' },
            { label: 'Date of Survey', value: workOrder.dateOfSurvey ? new Date(workOrder.dateOfSurvey).toLocaleDateString() : 'Not Recorded' },
            { label: 'Surveyors', value: workOrder.surveyors || 'No Surveyors Listed' },
            { label: 'Assigned To', value: workOrder.assignedTo || 'Not Assigned' },
            { label: 'Location Description', value: workOrder.locationDescription || 'No Location Details' },
            { label: 'Number of Entry Points', value: workOrder.numberOfEntryPoints || 'Not Recorded' }
        ];
        
        console.log('Creating metadata table');
        // Create a metadata table with left and right columns
        const metadataRows = [];
        const maxItems = Math.max(leftColumn.length, rightColumn.length);
        
        for (let i = 0; i < maxItems; i++) {
            const row = [];
            if (i < leftColumn.length) {
                row.push(`${leftColumn[i].label}: ${leftColumn[i].value}`);
            } else {
                row.push('');
            }
            
            if (i < rightColumn.length) {
                row.push(`${rightColumn[i].label}: ${rightColumn[i].value}`);
            } else {
                row.push('');
            }
            
            metadataRows.push(row);
        }
        
        try {
            autoTable(doc, {
                startY: yPos,
                head: [],
                body: metadataRows,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 5 },
                columnStyles: {
                    0: { cellWidth: 85 },
                    1: { cellWidth: 85 }
                },
                headStyles: { fillColor: [...lightGrayBg], textColor: [0, 0, 0] },
                alternateRowStyles: { fillColor: [...lightGrayBg] },
                margin: { left: 20, right: 20 }
            });
            console.log('Metadata table added successfully');
        } catch (tableError) {
            console.error('Error adding metadata table:', tableError);
            // Fallback to simple text if table fails
            metadataRows.forEach((row, index) => {
                doc.text(row[0], 20, yPos + (index * 10));
                doc.text(row[1], 110, yPos + (index * 10));
            });
        }
        
        yPos = doc.lastAutoTable.finalY + 10;
        
        console.log('Adding description section');
        // Add description section
        yPos = checkForNewPage(yPos, 35);
        
        // Add section header
        doc.setFillColor(...secondaryColor);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text('DESCRIPTION', 105, yPos + 5.5, { align: 'center' });
        yPos += 15;
        
        // Description content
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const descriptionLines = doc.splitTextToSize(workOrder.description || 'No description provided', 170);
        yPos = checkForNewPage(yPos, descriptionLines.length * 7);
        doc.text(descriptionLines, 20, yPos);
        yPos += descriptionLines.length * 7 + 10;
        
        // Calculate total pages and add footers
        totalPages = doc.getNumberOfPages();
        
        // Add footers to all pages
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter();
        }
        
        console.log('Saving PDF');
        // Save the PDF
        doc.save(`work-order-${workOrder._id || Date.now()}.pdf`);
        console.log('PDF saved successfully');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        Swal.fire({
            icon: 'error',
            title: 'PDF Generation Failed',
            text: 'There was an error generating the PDF. Please try again.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
};
    
    const handleEditWorkOrder = (workOrder) => {
        setEditingWorkOrder(workOrder);
        setFormData({
            title: workOrder.title,
            description: workOrder.description,
            priority: workOrder.priority,
            status: workOrder.status,
            assignedTo: workOrder.assignedTo || '',
            dueDate: new Date(workOrder.dueDate).toISOString().split('T')[0],
            location: workOrder.location,
            customerName: workOrder.customerName,
            customerContact: workOrder.customerContact || '',
            dateOfSurvey: new Date(workOrder.dateOfSurvey).toISOString().split('T')[0],
            surveyors: workOrder.surveyors,
            confinedSpaceName: workOrder.confinedSpaceName,
            building: workOrder.building,
            locationDescription: workOrder.locationDescription,
            confinedSpaceDescription: workOrder.confinedSpaceDescription || '',
            isConfinedSpace: workOrder.isConfinedSpace,
            isPermitRequired: workOrder.isPermitRequired,
            entryRequirements: workOrder.entryRequirements || '',
            hasAtmosphericHazard: workOrder.hasAtmosphericHazard,
            atmosphericHazardDescription: workOrder.atmosphericHazardDescription || '',
            hasEngulfmentHazard: workOrder.hasEngulfmentHazard,
            engulfmentHazardDescription: workOrder.engulfmentHazardDescription || '',
            hasConfigurationHazard: workOrder.hasConfigurationHazard,
            configurationHazardDescription: workOrder.configurationHazardDescription || '',
            hasOtherHazards: workOrder.hasOtherHazards,
            otherHazardsDescription: workOrder.otherHazardsDescription || '',
            requiresPPE: workOrder.requiresPPE,
            ppeList: workOrder.ppeList || '',
            isForcedAirVentilationSufficient: workOrder.isForcedAirVentilationSufficient,
            hasDedicatedAirMonitor: workOrder.hasDedicatedAirMonitor,
            hasWarningSign: workOrder.hasWarningSign,
            hasOtherPeopleWorking: workOrder.hasOtherPeopleWorking,
            canOthersSeeIntoSpace: workOrder.canOthersSeeIntoSpace,
            doContractorsEnter: workOrder.doContractorsEnter,
            numberOfEntryPoints: workOrder.numberOfEntryPoints || '',
            notes: workOrder.notes || '',
            pictures: []
        });
        setIsEditModalOpen(true);
    };




    const handleDeleteWorkOrder = async (workOrder) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/workorders/${workOrder._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire(
                    'Deleted!',
                    'Work order has been deleted.',
                    'success'
                );

                fetchWorkOrders();
            } catch (error) {
                console.error('Error deleting work order:', error);
                Swal.fire(
                    'Error!',
                    'Failed to delete work order.',
                    'error'
                );
            }
        }
    };

    const handleUpdateWorkOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token');
            
            // Upload new images to Firebase Storage if there are any
            let pictureUrls = [];
            if (formData.pictures && formData.pictures.length > 0) {
                try {
                    pictureUrls = await uploadImages(formData.pictures);
                } catch (error) {
                    console.error('Error uploading images:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Upload Failed',
                        text: 'Failed to upload images. Please try again.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    return;
                }
            }

            // Create the work order data without the File objects
            const workOrderData = {
                ...formData,
                pictures: pictureUrls // Replace File objects with URLs
            };

            const response = await axios.put(
                `http://localhost:5000/api/workorders/${editingWorkOrder._id}`,
                workOrderData,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Work Order Updated',
                    text: 'Work order has been updated successfully',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

                setIsEditModalOpen(false);
                setEditingWorkOrder(null);
                fetchWorkOrders();
            }
        } catch (error) {
            console.error('Error updating work order:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update work order',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    // Add this new function for handling image click
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsImageViewerOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-600 text-center">
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Work Order Management</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search work orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Work Order
                    </button>
                </div>
            </div>

            {/* Work Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredWorkOrders.map((workOrder) => (
                                <tr key={workOrder._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        #{workOrder._id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{workOrder.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{workOrder.customerName}</div>
                                        <div className="text-sm text-gray-500">{workOrder.customerContact}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(workOrder.status)}`}>
                                            {workOrder.status.charAt(0).toUpperCase() + workOrder.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(workOrder.priority)}`}>
                                            {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(workOrder.dueDate).toLocaleDateString()}
                                    </td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center">
    {workOrder.pictures && workOrder.pictures.length > 0 ? (
      <div className="relative">
        <FaImages
          className="h-8 w-8 text-blue-500 cursor-pointer"
          onClick={() => handleImageClick(workOrder.pictures[0])}
        />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {workOrder.pictures.length}
        </span>
      </div>
    ) : (
      <FaImages className="h-8 w-8 text-gray-300" />
    )}
  </div>
</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewWorkOrder(workOrder)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEditWorkOrder(workOrder)}
                                                className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                                                title="Edit Work Order"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWorkOrder(workOrder)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                title="Delete Work Order"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPDF(workOrder)}
                                                className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                                title="Download PDF"
                                            >
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Work Order Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Create New Work Order</h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWorkOrder} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.title ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.description ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.dueDate ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.dueDate && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.location ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.customerName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.customerName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Contact</label>
                                        <input
                                            type="text"
                                            name="customerContact"
                                            value={formData.customerContact}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Survey Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Survey Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Survey</label>
                                        <input
                                            type="date"
                                            name="dateOfSurvey"
                                            value={formData.dateOfSurvey}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.dateOfSurvey ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.dateOfSurvey && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dateOfSurvey}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Surveyor(s)</label>
                                        <input
                                            type="text"
                                            name="surveyors"
                                            value={formData.surveyors}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.surveyors ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.surveyors && (
                                            <p className="mt-1 text-sm text-red-600">{errors.surveyors}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confined Space Name/ID</label>
                                        <input
                                            type="text"
                                            name="confinedSpaceName"
                                            value={formData.confinedSpaceName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.confinedSpaceName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.confinedSpaceName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confinedSpaceName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Building</label>
                                        <input
                                            type="text"
                                            name="building"
                                            value={formData.building}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.building ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.building && (
                                            <p className="mt-1 text-sm text-red-600">{errors.building}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Location Description (Room, Floor)</label>
                                        <input
                                            type="text"
                                            name="locationDescription"
                                            value={formData.locationDescription}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.locationDescription ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.locationDescription && (
                                            <p className="mt-1 text-sm text-red-600">{errors.locationDescription}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Confined Space Assessment Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Confined Space Assessment</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confined Space?</label>
                                            <select
                                                name="isConfinedSpace"
                                                value={formData.isConfinedSpace}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Permit Required?</label>
                                            <select
                                                name="isPermitRequired"
                                                value={formData.isPermitRequired}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confined Space Description</label>
                                        <textarea
                                            name="confinedSpaceDescription"
                                            value={formData.confinedSpaceDescription}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Entry Requirements</label>
                                        <textarea
                                            name="entryRequirements"
                                            value={formData.entryRequirements}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hazards Assessment Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Hazards Assessment</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Atmospheric Hazard?</label>
                                            <select
                                                name="hasAtmosphericHazard"
                                                value={formData.hasAtmosphericHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasAtmosphericHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Atmospheric Hazard</label>
                                                <textarea
                                                    name="atmosphericHazardDescription"
                                                    value={formData.atmosphericHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Engulfment Hazard?</label>
                                            <select
                                                name="hasEngulfmentHazard"
                                                value={formData.hasEngulfmentHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasEngulfmentHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Engulfment Hazard</label>
                                                <textarea
                                                    name="engulfmentHazardDescription"
                                                    value={formData.engulfmentHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Configuration Hazard?</label>
                                            <select
                                                name="hasConfigurationHazard"
                                                value={formData.hasConfigurationHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasConfigurationHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Configuration Hazard</label>
                                                <textarea
                                                    name="configurationHazardDescription"
                                                    value={formData.configurationHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Other Recognized Hazards?</label>
                                            <select
                                                name="hasOtherHazards"
                                                value={formData.hasOtherHazards}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasOtherHazards === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Hazards</label>
                                                <textarea
                                                    name="otherHazardsDescription"
                                                    value={formData.otherHazardsDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Safety Requirements Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Safety Requirements</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PPE Required?</label>
                                            <select
                                                name="requiresPPE"
                                                value={formData.requiresPPE}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.requiresPPE === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">List PPE</label>
                                                <textarea
                                                    name="ppeList"
                                                    value={formData.ppeList}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Is Forced Air Ventilation Alone Sufficient?</label>
                                            <select
                                                name="isForcedAirVentilationSufficient"
                                                value={formData.isForcedAirVentilationSufficient}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Dedicated Continuous Air Monitor?</label>
                                            <select
                                                name="hasDedicatedAirMonitor"
                                                value={formData.hasDedicatedAirMonitor}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Warning Sign Posted?</label>
                                        <select
                                            name="hasWarningSign"
                                            value={formData.hasWarningSign}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Other People Working Near Space?</label>
                                        <select
                                            name="hasOtherPeopleWorking"
                                            value={formData.hasOtherPeopleWorking}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Can Others See into Space?</label>
                                        <select
                                            name="canOthersSeeIntoSpace"
                                            value={formData.canOthersSeeIntoSpace}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Do Contractors enter Space?</label>
                                        <select
                                            name="doContractorsEnter"
                                            value={formData.doContractorsEnter}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Number of Entry Points</label>
                                        <input
                                            type="number"
                                            name="numberOfEntryPoints"
                                            value={formData.numberOfEntryPoints}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Pictures</label>
                                    <div 
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const files = Array.from(e.dataTransfer.files).filter(file => 
                                                file.type.startsWith('image/')
                                            );
                                            setFormData(prev => ({
                                                ...prev,
                                                pictures: [...(prev.pictures || []), ...files]
                                            }));
                                        }}
                                    >
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload files</span>
                                                    <input 
                                                        type="file" 
                                                        className="sr-only" 
                                                        multiple 
                                                        accept="image/*" 
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                pictures: [...(prev.pictures || []), ...files]
                                                            }));
                                                        }}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            {formData.pictures && formData.pictures.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        {formData.pictures.length} file(s) selected
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Create Work Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Work Order Modal */}
            {isModalOpen && selectedWorkOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                Work Order Details #{selectedWorkOrder._id.slice(-6)}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Work Order Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-900">Title: {selectedWorkOrder.title}</p>
                                    <p className="text-sm text-gray-900">Description: {selectedWorkOrder.description}</p>
                                    <p className="text-sm text-gray-900">Status: <span className={`px-2 py-1 rounded-full ${getStatusColor(selectedWorkOrder.status)}`}>
                                        {selectedWorkOrder.status.charAt(0).toUpperCase() + selectedWorkOrder.status.slice(1)}
                                    </span></p>
                                    <p className="text-sm text-gray-900">Priority: <span className={`px-2 py-1 rounded-full ${getPriorityColor(selectedWorkOrder.priority)}`}>
                                        {selectedWorkOrder.priority.charAt(0).toUpperCase() + selectedWorkOrder.priority.slice(1)}
                                    </span></p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-900">Name: {selectedWorkOrder.customerName}</p>
                                    <p className="text-sm text-gray-900">Contact: {selectedWorkOrder.customerContact}</p>
                                    <p className="text-sm text-gray-900">Location: {selectedWorkOrder.location}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule Information</h4>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-900">Due Date: {new Date(selectedWorkOrder.dueDate).toLocaleDateString()}</p>
                                    {selectedWorkOrder.assignedTo && (
                                        <p className="text-sm text-gray-900">Assigned To: {selectedWorkOrder.assignedTo}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => handleDownloadPDF(selectedWorkOrder)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                Download PDF
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Work Order Modal */}
            {isEditModalOpen && editingWorkOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Edit Work Order</h3>
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingWorkOrder(null);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateWorkOrder} className="space-y-6">
                            {/* Basic Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.title ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.description ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.dueDate ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.dueDate && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.location ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.customerName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.customerName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Customer Contact</label>
                                        <input
                                            type="text"
                                            name="customerContact"
                                            value={formData.customerContact}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Survey Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Survey Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Survey</label>
                                        <input
                                            type="date"
                                            name="dateOfSurvey"
                                            value={formData.dateOfSurvey}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.dateOfSurvey ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.dateOfSurvey && (
                                            <p className="mt-1 text-sm text-red-600">{errors.dateOfSurvey}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Surveyor(s)</label>
                                        <input
                                            type="text"
                                            name="surveyors"
                                            value={formData.surveyors}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.surveyors ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.surveyors && (
                                            <p className="mt-1 text-sm text-red-600">{errors.surveyors}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Location Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confined Space Name/ID</label>
                                        <input
                                            type="text"
                                            name="confinedSpaceName"
                                            value={formData.confinedSpaceName}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.confinedSpaceName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.confinedSpaceName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.confinedSpaceName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Building</label>
                                        <input
                                            type="text"
                                            name="building"
                                            value={formData.building}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.building ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.building && (
                                            <p className="mt-1 text-sm text-red-600">{errors.building}</p>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Location Description (Room, Floor)</label>
                                        <input
                                            type="text"
                                            name="locationDescription"
                                            value={formData.locationDescription}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.locationDescription ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.locationDescription && (
                                            <p className="mt-1 text-sm text-red-600">{errors.locationDescription}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Confined Space Assessment Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Confined Space Assessment</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Confined Space?</label>
                                            <select
                                                name="isConfinedSpace"
                                                value={formData.isConfinedSpace}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Permit Required?</label>
                                            <select
                                                name="isPermitRequired"
                                                value={formData.isPermitRequired}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Confined Space Description</label>
                                        <textarea
                                            name="confinedSpaceDescription"
                                            value={formData.confinedSpaceDescription}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Entry Requirements</label>
                                        <textarea
                                            name="entryRequirements"
                                            value={formData.entryRequirements}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Hazards Assessment Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Hazards Assessment</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Atmospheric Hazard?</label>
                                            <select
                                                name="hasAtmosphericHazard"
                                                value={formData.hasAtmosphericHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasAtmosphericHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Atmospheric Hazard</label>
                                                <textarea
                                                    name="atmosphericHazardDescription"
                                                    value={formData.atmosphericHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Engulfment Hazard?</label>
                                            <select
                                                name="hasEngulfmentHazard"
                                                value={formData.hasEngulfmentHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasEngulfmentHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Engulfment Hazard</label>
                                                <textarea
                                                    name="engulfmentHazardDescription"
                                                    value={formData.engulfmentHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Configuration Hazard?</label>
                                            <select
                                                name="hasConfigurationHazard"
                                                value={formData.hasConfigurationHazard}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasConfigurationHazard === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Configuration Hazard</label>
                                                <textarea
                                                    name="configurationHazardDescription"
                                                    value={formData.configurationHazardDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Other Recognized Hazards?</label>
                                            <select
                                                name="hasOtherHazards"
                                                value={formData.hasOtherHazards}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.hasOtherHazards === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Describe Hazards</label>
                                                <textarea
                                                    name="otherHazardsDescription"
                                                    value={formData.otherHazardsDescription}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Safety Requirements Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Safety Requirements</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">PPE Required?</label>
                                            <select
                                                name="requiresPPE"
                                                value={formData.requiresPPE}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        {formData.requiresPPE === 'Y' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">List PPE</label>
                                                <textarea
                                                    name="ppeList"
                                                    value={formData.ppeList}
                                                    onChange={handleInputChange}
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Is Forced Air Ventilation Alone Sufficient?</label>
                                            <select
                                                name="isForcedAirVentilationSufficient"
                                                value={formData.isForcedAirVentilationSufficient}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Dedicated Continuous Air Monitor?</label>
                                            <select
                                                name="hasDedicatedAirMonitor"
                                                value={formData.hasDedicatedAirMonitor}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Warning Sign Posted?</label>
                                        <select
                                            name="hasWarningSign"
                                            value={formData.hasWarningSign}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Other People Working Near Space?</label>
                                        <select
                                            name="hasOtherPeopleWorking"
                                            value={formData.hasOtherPeopleWorking}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Can Others See into Space?</label>
                                        <select
                                            name="canOthersSeeIntoSpace"
                                            value={formData.canOthersSeeIntoSpace}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Do Contractors enter Space?</label>
                                        <select
                                            name="doContractorsEnter"
                                            value={formData.doContractorsEnter}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Y">Yes</option>
                                            <option value="N">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Number of Entry Points</label>
                                        <input
                                            type="number"
                                            name="numberOfEntryPoints"
                                            value={formData.numberOfEntryPoints}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Pictures</label>
                                    <div 
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const files = Array.from(e.dataTransfer.files).filter(file => 
                                                file.type.startsWith('image/')
                                            );
                                            setFormData(prev => ({
                                                ...prev,
                                                pictures: [...(prev.pictures || []), ...files]
                                            }));
                                        }}
                                    >
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload files</span>
                                                    <input 
                                                        type="file" 
                                                        className="sr-only" 
                                                        multiple 
                                                        accept="image/*" 
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files);
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                pictures: [...(prev.pictures || []), ...files]
                                                            }));
                                                        }}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            {formData.pictures && formData.pictures.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        {formData.pictures.length} file(s) selected
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingWorkOrder(null);
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Update Work Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {isImageViewerOpen && selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                    <div className="relative max-w-4xl max-h-[90vh] mx-auto">
                        <button
                            onClick={() => setIsImageViewerOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <XCircleIcon className="h-8 w-8" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size work order image"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <a
                            href={selectedImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-md hover:bg-opacity-100 transition-opacity duration-200"
                        >
                            Open in New Tab
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkOrderManagement;