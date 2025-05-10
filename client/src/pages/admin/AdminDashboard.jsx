import React from 'react'
import { useUser } from '../../context/UserContext';
import { FiUsers, FiBook, FiCalendar, FiAward } from 'react-icons/fi';

// Dummy data for the dashboard
const stats = [
    { name: 'Total Technician', value: '1,234', change: '+5%', changeType: 'increase', icon: <FiUsers className="text-blue-600" /> },
    
];

// const recent work orders = [
//     { subject: 'Mathematics', date: '2024-04-25', time: '09:00 AM', duration: '2 hours' },
//     { subject: 'Science', date: '2024-04-26', time: '10:00 AM', duration: '1.5 hours' },
// ];



const AdminDashboard = () => {
  return (
    <div>AdminDashboard</div>
  )
}

export default AdminDashboard