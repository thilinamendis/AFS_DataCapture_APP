import React from 'react'
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
    const {user} = useUser();

    return(
        <div className="p-6 space-y-8">
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
                    
    )
}