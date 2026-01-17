// src/pages/LoginPage.tsx
import React from 'react';
import LoginForm from '../components/adminLoginForm';
import './loginpage.css'; // Import the new CSS

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default LoginPage;