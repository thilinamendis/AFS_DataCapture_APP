import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    EyeIcon, 
    PlusIcon, 
    MagnifyingGlassIcon, 
    ArrowDownTrayIcon,
    XCircleIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

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
        customerContact: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchWorkOrders();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/workorders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkOrders(response.data || []);
        } catch (error) {
            setError('Failed to fetch work orders');
            console.error('Error fetching work orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkOrders = workOrders.filter(workOrder => {
        const statusMatch = filterStatus === 'all' || workOrder.status === filterStatus;
        const searchMatch = `${workOrder.title} ${workOrder.customerName} ${workOrder.location}`.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return statusMatch && searchMatch;
    });

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
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateWorkOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/workorders', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

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
                customerContact: ''
            });
            setErrors({});
            fetchWorkOrders();
        } catch (error) {
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
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleViewWorkOrder(workOrder)}
                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                        title="View Details"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Work Order Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
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

                        <form onSubmit={handleCreateWorkOrder} className="space-y-4">
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
                            </div>

                            <div>
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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

                        <div className="mt-6 flex justify-end">
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
        </div>
    );
}

export default WorkOrderManagement; 