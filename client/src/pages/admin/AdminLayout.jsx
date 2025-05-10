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