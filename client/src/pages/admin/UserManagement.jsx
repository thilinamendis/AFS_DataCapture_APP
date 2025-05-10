import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { EyeIcon, UserPlusIcon, UserMinusIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XCircleIcon, PlusIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../../utils/pdfGenerator';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterRole, setFilterRole] = useState('all');
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        userType: 'technician',
        isAdmin: false
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [errors, setErrors] = useState({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (error) {
            setError('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        // Filter by role
        const roleMatch = filterRole === 'all' || 
                         (filterRole === 'admin' && user.isAdmin) || 
                         (filterRole === 'technician' && user.userType === 'technician');
        
        // Filter by search query
        const searchMatch = `${user.firstname} ${user.lastname} ${user.email}`.toLowerCase()
            .includes(searchQuery.toLowerCase());
        
        return roleMatch && searchMatch;
    });

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleToggleAdmin = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/auth/users/${userId}`,
                { isAdmin: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Status Updated',
                text: `User admin status has been ${!currentStatus ? 'granted' : 'revoked'}`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update user status',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
        } else if (formData.firstname.length < 2) {
            newErrors.firstname = 'First name must be at least 2 characters';
        }

        // Last Name validation
        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Last name is required';
        } else if (formData.lastname.length < 2) {
            newErrors.lastname = 'Last name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Phone validation (optional)
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                icon: 'success',
                title: 'User Created',
                text: 'New user has been created successfully',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });

            setIsCreateModalOpen(false);
            setFormData({
                firstname: '',
                lastname: '',
                email: '',
                password: '',
                phone: '',
                address: '',
                userType: 'technician',
                isAdmin: false
            });
            setErrors({});
            fetchUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.response?.data?.message || 'Failed to create user',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDeleteUser = async (userId) => {
        try {
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
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'User has been deleted.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                fetchUsers();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Failed to delete user',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const getUserTypeColor = (userType) => {
        switch (userType) {
            case 'technician':
                return 'bg-green-100 text-green-800';
            case 'admin':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDownloadReport = () => {
        const columns = [
            { header: 'User ID', accessor: (user) => `#${user._id.slice(-6)}` },
            { header: 'Name', accessor: (user) => `${user.firstname} ${user.lastname}` },
            { header: 'Email', accessor: (user) => user.email },
            { header: 'User Type', accessor: (user) => user.userType },
            { header: 'Role', accessor: (user) => user.isAdmin ? 'Admin' : 'User' },
            { header: 'Joined Date', accessor: (user) => formatDate(user.createdAt) }
        ];

        generatePDF('User Management Report', filteredUsers, columns, 'user-management-report.pdf', 'users');
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
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                
                {/* Mobile Menu Button */}
                <div className="md:hidden w-full flex justify-end">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        <EllipsisVerticalIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Controls - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 lg:w-64"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="all">All Users</option>
                        <option value="technician">Technician</option>
                        <option value="admin">Admins</option>
                    </select>
                    <button
                        onClick={handleDownloadReport}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center text-sm"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        <span className="hidden lg:inline">Download Report</span>
                        <span className="lg:hidden">Export</span>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        <span className="hidden lg:inline">Add New User</span>
                        <span className="lg:hidden">Add User</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden mb-4 bg-white p-4 rounded-lg shadow-md space-y-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                        >
                            <option value="all">All Users</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admins</option>
                        </select>
                        <button
                            onClick={handleDownloadReport}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center text-sm"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Export
                        </button>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add User
                    </button>
                </div>
            )}
            
            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                {user.firstname.charAt(0)}{user.lastname.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</div>
                                                <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                                                <div className="sm:hidden flex items-center mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getUserTypeColor(user.userType)}`}>
                                                        {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                                    </span>
                                                    {user.isAdmin && (
                                                        <span className="ml-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserTypeColor(user.userType)}`}>
                                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                        </span>
                                    </td>
                                    <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.isAdmin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td className="hidden xl:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                                                className={`${user.isAdmin ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors duration-200 p-1 rounded-full hover:bg-gray-50`}
                                                title={user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                            >
                                                {user.isAdmin ? <UserMinusIcon className="h-5 w-5" /> : <UserPlusIcon className="h-5 w-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                                title="Delete User"
                                            >
                                                <XCircleIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500">No users found matching your criteria</div>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterRole('all');
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">
                                User Details #{selectedUser._id.slice(-6)}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    {selectedUser.firstname.charAt(0)}{selectedUser.lastname.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{selectedUser.firstname} {selectedUser.lastname}</p>
                                                    <p className="text-xs text-gray-500">Member since {formatDate(selectedUser.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getUserTypeColor(selectedUser.userType)}`}>
                                                    {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)}
                                                </span>
                                                {selectedUser.isAdmin && (
                                                    <span className="ml-2 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Contact Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <p className="text-sm text-gray-900">{selectedUser.email}</p>
                                            </div>
                                            {selectedUser.phone && (
                                                <div className="flex items-center">
                                                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            Address Information
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedUser.address ? (
                                                <p className="text-sm text-gray-900">{selectedUser.address}</p>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No address provided</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
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

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${errors.firstname ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.firstname && (
                                        <p className="mt-1 text-xs text-red-600">{errors.firstname}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${errors.lastname ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.lastname && (
                                        <p className="mt-1 text-xs text-red-600">{errors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                                <select
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                >
                                    <option value="technician">Technician</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                />
                            </div>

                            <div className="mt-4 flex items-center">
                                <input
                                    type="checkbox"
                                    name="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Make this user an admin
                                </label>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setErrors({});
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;