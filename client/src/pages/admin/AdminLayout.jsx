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

    const stats = {
        totalWorkOrders: 150,
        totalTechnician: 20,
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
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                        location.pathname === item.to
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
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                        location.pathname === item.to
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

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {location.pathname === '/admin' ? (
                            <div className="space-y-6">
                                {/* Welcome Section */}
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">
                                                    Welcome back, {user?.firstName} {user?.lastName}!
                                                </h2>
                                                <p className="mt-1 text-sm text-blue-100">
                                                    {new Date().toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-sm text-blue-100">Role</p>
                                                    <p className="text-lg font-semibold text-white">Administrator</p>
                                                </div>
                                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                                                    <span className="text-xl font-bold text-white">
                                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Total Work Orders */}
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <UsersIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Work Orders</dt>
                                                        <dd className="text-lg font-medium text-gray-900">{stats.totalWorkOrders}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Technician */}
                                    <div className="bg-white overflow-hidden shadow rounded-lg">
                                        <div className="p-5">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <UsersIcon className="h-6 w-6 text-green-400" />
                                                </div>
                                                <div className="ml-5 w-0 flex-1">
                                                    <dl>
                                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Technician</dt>
                                                        <dd className="text-lg font-medium text-gray-900">{stats.totalTechnician}</dd>
                                                    </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
