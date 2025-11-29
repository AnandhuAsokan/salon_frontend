// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoutes';
import LoginPage from './pages/loginPage';
import DashboardPage from './pages/dashboard';
import TodosPage from './pages/todosPage'; // <-- Import the new page

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* All routes below are protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/todos" element={<TodosPage />} />
          </Route>
          
          {/* Default route will redirect to the dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Any other unknown route will redirect to the login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;