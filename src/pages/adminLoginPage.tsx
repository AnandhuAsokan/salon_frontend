import React from 'react';
import LoginForm from '../components/adminLoginForm';
import './loginpage.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default LoginPage;