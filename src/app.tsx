// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoutes';
import LoginPage from './pages/adminLoginPage';
import DashboardPage from './pages/dashboard';
import TodosPage from './pages/todosPage'; // <-- Import the new page
import SignupPage from './pages/asminSign';
import UserLogin from './pages/loginPage';
import UserSignup from './pages/userSignup';
import ServicesPage from './pages/ServicePage';
import ServiceDetailPage from './pages/serviceDetailPage';
import BookingHistoryPage from './pages/bookingHistoryPage';
import AdminDashboard from './pages/adminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/adminsignup" element={<SignupPage />} />
          <Route path="/adminlogin" element={<LoginPage />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />

          {/* All routes below are protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service-details/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/booking-history" element={<BookingHistoryPage />} />
            <Route path="/adminDashboard" element={<AdminDashboard />} />
          </Route>

          {/* Default route will redirect to the dashboard */}
          <Route path="/" element={<Navigate to="/signup" />} />

          {/* Any other unknown route will redirect to the login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
