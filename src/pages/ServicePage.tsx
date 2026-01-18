import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Service } from '../types';
import './ServicePage.css';
import confetti from 'canvas-confetti';

interface SlotData {
  staffId: string;
  name: string;
  date: string;
  slots: string[];
}

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsData, setSlotsData] = useState<SlotData[]>([]);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    staffId: string;
    staffName: string;
    timeSlot: string;
    date: string;
  } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data.data);
      } catch (err: any) {
        setServiceError('Failed to load services.');
        console.error(err);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleBookNowClick = (service: Service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSlotsData([]);
    setSelectedSlot(null);
    setSlotError(null);
    setIsModalOpen(true);
  };

  const handleConfirmDate = async () => {
    if (!selectedService || !selectedDate) return;

    setIsLoadingSlots(true);
    setSlotError(null);
    setSlotsData([]);
    setSelectedSlot(null);

    try {
      const response = await api.post('/services/staff-slots', {
        serviceId: selectedService._id,
        date: selectedDate,
      });
      setSlotsData(response.data.data);
    } catch (err: any) {
      setSlotError(err.response?.data?.message || 'Failed to load slots.');
      console.error(err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSlotSelect = (staffId: string, staffName: string, timeSlot: string, date: string) => {
    setSelectedSlot({ staffId, staffName, timeSlot, date });
  };

  const handleFinalBooking = async () => {
    if (!selectedSlot || !selectedService) return;

    setIsBooking(true);
    try {
      const payload = {
        serviceId: selectedService._id,
        staffId: selectedSlot.staffId,
        date: selectedSlot.date,
        slot: selectedSlot.timeSlot,
      };

      await api.post('/bookings', payload);

      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 2000,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
      });

      setTimeout(() => {
        alert('Booking Confirmed Successfully!');
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleOpenHistory = () => {
    setIsProfileMenuOpen(false);
    navigate('/booking-history');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getMaxDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString().split('T')[0];
  };

  if (isLoadingServices) return <div className="loading">Loading services...</div>;
  if (serviceError) return <div className="error">{serviceError}</div>;

  return (
    <div className="services-page">
      <div className="profile-wrapper">
        <div className="profile-icon" onClick={toggleProfileMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>

        {isProfileMenuOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={handleOpenHistory}>
              Booking History
            </div>
            <div className="dropdown-item logout" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>

      <div className="services-header">
        <h1>Our Services</h1>
        <p>Select a service to book an appointment</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service._id} className="service-card">
            <div className="service-image-container">
              <img
                src={`https://t4.ftcdn.net/jpg/04/69/68/17/360_F_469681744_FZWt6LKXLoCU4XVv8Cjx6ZFmwNlNLm7x.jpg`}
                alt={service.name}
                className="service-image"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/400x250?text=No+Image';
                }}
              />
              <span className="service-category-badge">{service.category}</span>
            </div>

            <div className="service-content">
              <h3 className="service-name">{service.name}</h3>
              <p className="service-description">{service.description}</p>

              <div className="service-meta">
                <span className="meta-item">⏱ {service.duration} min</span>
                <span className="meta-item">👤 {service.idealFor}</span>
              </div>

              <div className="service-footer">
                <span className="service-price">${service.price}</span>
                <button className="book-btn" onClick={() => handleBookNowClick(service)}>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Appointment</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-step">
                <label htmlFor="date-input">Select Date:</label>
                <input
                  type="date"
                  id="date-input"
                  min={getTodayString()}
                  max={getMaxDateString()}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="date-input"
                />
                {!slotsData.length && (
                  <button
                    className="btn-primary"
                    onClick={handleConfirmDate}
                    disabled={!selectedDate || isLoadingSlots}
                  >
                    {isLoadingSlots ? 'Checking Availability...' : 'Confirm Date'}
                  </button>
                )}
              </div>

              {slotError && <div className="error-msg">{slotError}</div>}

              {slotsData.length > 0 && (
                <div className="slots-container">
                  <h3>Available Slots for {selectedDate}</h3>

                  {slotsData.map(staffGroup => (
                    <div key={staffGroup.staffId} className="staff-slots-group">
                      <div className="staff-divider">
                        <span className="staff-badge">{staffGroup.name}</span>
                      </div>

                      <div className="slots-grid">
                        {staffGroup.slots.map((slot, index) => {
                          const isSelected =
                            selectedSlot?.staffId === staffGroup.staffId &&
                            selectedSlot?.timeSlot === slot;
                          return (
                            <button
                              key={index}
                              className={`slot-chip ${isSelected ? 'selected' : ''}`}
                              onClick={() =>
                                handleSlotSelect(
                                  staffGroup.staffId,
                                  staffGroup.name,
                                  slot,
                                  staffGroup.date
                                )
                              }
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="modal-footer">
                <div className="selection-summary">
                  <p>
                    Selected: <strong>{selectedSlot.timeSlot}</strong> with{' '}
                    <strong>{selectedSlot.staffName}</strong>
                  </p>
                </div>
                <button
                  className="btn-confirm-booking"
                  onClick={handleFinalBooking}
                  disabled={isBooking}
                >
                  {isBooking ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
