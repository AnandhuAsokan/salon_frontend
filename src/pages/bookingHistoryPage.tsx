import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ServicePage.css';

interface Booking {
  _id: string;
  staffId: { name: string };
  serviceId: { name: string; price: number };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const getUserId = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        return parsed._id || parsed.userInfo?._id;
      } catch (e) {
        console.error('Error parsing userInfo', e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.post(`/bookings/client/`);
        setBookings(response.data.data);
      } catch (err: any) {
        setError('Failed to load booking history.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setIsCancelling(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      const userId = getUserId();
      const response = await api.post(`/bookings/client`);
      setBookings(response.data.data);

      alert('Booking cancelled successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to cancel booking.');
    } finally {
      setIsCancelling(null);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <button className="back-btn-link" onClick={goBack}>
          ← Back
        </button>
        <h1>Booking History</h1>
      </div>

      {isLoading ? (
        <div className="loading">Loading history...</div>
      ) : error ? (
        <div className="error-container">
          <p className="error">{error}</p>
          <button className="btn-primary" onClick={goBack}>
            Go Back
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>You have no bookings yet.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Book Now
          </button>
        </div>
      ) : (
        <div className="history-list-container">
          {bookings.map(booking => (
            <div key={booking._id} className="history-card">
              <div className="history-info">
                <h3>{booking.serviceId.name}</h3>
                <div className="history-meta">
                  <span className="meta-item">👤 {booking.staffId.name}</span>
                  <span className="meta-item">📅 {booking.date}</span>
                  <span className="meta-item">
                    ⏰ {booking.startTime} - {booking.endTime}
                  </span>
                  <span className="meta-item">💰 ${booking.amount}</span>
                </div>
              </div>

              <div className="history-actions">
                <span className={`status-badge ${booking.status.toLowerCase()}`}>
                  {booking.status.toUpperCase()}
                </span>

                {booking.status === 'pending' && (
                  <button
                    className={`cancel-btn ${isCancelling === booking._id ? 'loading' : ''}`}
                    onClick={() => handleCancel(booking._id)}
                    disabled={isCancelling !== null}
                  >
                    {isCancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;
