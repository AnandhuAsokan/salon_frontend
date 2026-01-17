import React from 'react';
import SignupForm from '../components/adminSignup';
import './loginPage.css';

const SignupPage: React.FC = () => {
  return (
    <div className="login-page">
      <SignupForm />
    </div>
  );
};

export default SignupPage;