import React, { useEffect } from 'react'
import { useUser } from '../../context/UserContext';
import { FiUsers, FiBook, FiCalendar, FiAward } from 'react-icons/fi';

// Dummy data for the dashboard
const stats = [
    { name: 'Total Technician', value: '1,234', change: '+5%', changeType: 'increase', icon: <FiUsers className="text-blue-600" /> },
    { name: 'Total workorders', value: '45', change: '+2%', changeType: 'increase', icon: <FiBook className="text-green-600" /> },
    { name: 'Upcoming Ordeers', value: '12', change: '0%', changeType: 'neutral', icon: <FiCalendar className="text-yellow-600" /> },
    { name: 'Average', value: '85%', change: '+3%', changeType: 'increase', icon: <FiAward className="text-purple-600" /> },
];

export default function Dashboard(){
    const {user, loading} = useUser();
    
    // Helper function to get name regardless of property name format
    const getfirstname = () => {
        console.log('Getting firstname, user data:', user);
        const name = user?.firstname || user?.firstName || 'User';
        console.log('Firstname result:', name);
        return name;
    };

    const getfastname = () => {
        console.log('Getting lastname, user data:', user);
        const name = user?.lastname || user?.lastName || '';
        console.log('Lastname result:', name);
        return name;
    };

    const getInitials = () => {
        const first = getfirstname()[0] || 'U';
        const last = getlastname()[0] || '';
        console.log('Initials:', `${first}${last}`);
        return `${first}${last}`;
    };

    useEffect(() => {
        console.log('Dashboard - Component mounted');
        console.log('Dashboard - User data:', user);
        console.log('Dashboard - Loading state:', loading);
    }, [user, loading]);

    if (loading) {
        console.log('Dashboard - Showing loading state');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold">Loading...</div>
            </div>
        );
    }

    if (!user) {
        console.log('Dashboard - No user data available');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold text-red-600">Please log in to view the dashboard</div>
            </div>
        );
    }

    // Debug display
    const debugInfo = {
        firstname: getfirstname(),
        lastname: getfastname(),
        isAdmin: user.isAdmin ? 'Yes' : 'No',
        userType: user.userType || 'Not set',
        rawData: user
    };

    console.log('Debug Info:', debugInfo);

    return(
        <div className="p-6 space-y-8">
            {/* Debug Info - Remove in production */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-800">Debug Info:</h3>
                <pre className="mt-2 text-xs text-yellow-700">
                    {JSON.stringify(debugInfo, null, 2)}
                </pre>
            </div>

            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Welcome back, {getfirstname()} {getlastname()}!
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
                                <p className="text-lg font-semibold text-white">
                                    {user.isAdmin ? 'Administrator' : user.userType || 'User'}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {getInitials()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white shadow rounded-2xl p-5 flex items-center space-x-4">
                        <div className="text-3xl bg-gray-100 p-3 rounded-full">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.name}</p>
                            <p className="text-xl font-semibold">{stat.value}</p>
                            <p className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
                                {stat.changeType === 'increase' ? '+' : stat.changeType === 'decrease' ? '-' : ''}{stat.change}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>    
    )
}