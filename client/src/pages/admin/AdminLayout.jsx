import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
    HomeIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    // Dummy stats data
    const stats = {
        totalUsers: 150,
        totalStudents: 120,
        totalTeachers: 20,
        totalExaminers: 10
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', to: '/admin', icon: HomeIcon },
        { name: 'User Management', to: '/admin/users', icon: UsersIcon }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
                    <div className="flex h-16 items-center justify-between px-4">
                        <h2 className="text-xl font-semibold text-gray-900">Admin Portal</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-500 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${location.pathname === item.to
                                        ? 'text-gray-500'
                                        : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
                    <div className="flex h-16 items-center px-4">
                        <h2 className="text-xl font-semibold text-gray-900">Admin Portal</h2>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${location.pathname === item.to
                                        ? 'text-gray-500'
                                        : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                />
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>