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

const Dashboard = () => {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard