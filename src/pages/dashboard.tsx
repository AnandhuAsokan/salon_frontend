// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        // The API key and JWT are automatically added by interceptors
        const response = await api.get('/api/auth/profile');
        setProfileData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile.');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user && <h2>Welcome, {user.name}!</h2>}
      <button onClick={logout}>Logout</button>

      <hr />
      <h3>Protected Profile Data</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {profileData ? (
        <pre>{JSON.stringify(profileData, null, 2)}</pre>
      ) : (
        <p>Loading profile data...</p>
      )}
    </div>
  );
};

export default DashboardPage;