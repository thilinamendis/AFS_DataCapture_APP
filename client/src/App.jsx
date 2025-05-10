import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

// User components
import Login from './pages/user/Login';
import Register from './pages/user/Register';

// Admin components
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// // Student components
// import StudentLayout from './pages/student/StudentLayout';
// import StudentDashboard from './pages/student/StudentDashboard';
// import StudentProfile from './pages/student/StudentProfile';
// import StudentExams from './pages/student/StudentExams';
// import StudentAssignments from './pages/student/StudentAssignments';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Root path redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student/*" element={
            <StudentLayout />
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="assignments" element={<StudentAssignments />} />
          </Route>
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;