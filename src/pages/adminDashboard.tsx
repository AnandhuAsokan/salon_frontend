import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ServicePage.css';


interface Booking {
  _id: string;
  staffId: { name: string; _id: string };
  serviceId: { name: string; price: number; _id: string };
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  amount: number;
}

interface ServiceOption {
  _id: string;
  name: string;
}

interface Service {
  _id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  idealFor: string;
  isActive?: boolean;
}

interface Staff {
  _id?: string;
  name: string;
  age: number;
  gender: string;
  status?: string;
  email?: string;
  leaveDays: string[];
  experience: number;
  phone: string;
  services: string[];
}

interface BusiestTime {
  time: string;
  bookings: number;
}

interface AnalyticsData {
  dateRange: { from: string; to: string };
  totalBookings: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  busiestTimes: BusiestTime[];
}

interface PeakTimeData {
  date: string;
  periods: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  peakPeriod: {
    name: string;
    bookings: number;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'bookings' | 'staff' | 'services' | 'reports'>(
    'bookings'
  );

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsDates, setAnalyticsDates] = useState({ start: '', end: '' });
  const [peakTimeData, setPeakTimeData] = useState<PeakTimeData | null>(null);
  const [peakTimeDate, setPeakTimeDate] = useState('');
  const [reportLoading, setReportLoading] = useState<string>('');

  const [holidayDate, setHolidayDate] = useState('');
  const [weeklyOffDay, setWeeklyOffDay] = useState('monday');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('21:00');
  const [isSubmittingAction, setIsSubmittingAction] = useState<string | null>(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const today = getToday();
    setAnalyticsDates({ start: today, end: today });
    setPeakTimeDate(today);
  }, []);


    const convertToAmPm = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes}${ampm}`;
  };

  const convertToSlashDate = (date: string) => {
    return date.replace(/-/g, '/');
  };


  const fetchServiceOptions = async () => {
    try {
      const response = await api.get('/services/');
      setAvailableServices(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch service options');
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/bookings/');
      setBookings(response.data.data || []);
    } catch (err: any) {
      setError('Failed to load bookings.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/staff/');
      setStaff(response.data.data || []);
    } catch (err: any) {
      setError('Failed to load staff.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/services/');
      setServices(response.data.data || []);
      setAvailableServices(response.data.data || []);
    } catch (err: any) {
      setError('Failed to load services.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setReportLoading('analytics');
    setAnalyticsData(null);
    try {
      const response = await api.post('/bookings/analytics', {
        startDate: analyticsDates.start,
        endDate: analyticsDates.end,
      });
      setAnalyticsData(response.data.data);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load analytics.');
    } finally {
      setReportLoading('');
    }
  };

  const fetchPeakTime = async () => {
    setReportLoading('peak');
    setPeakTimeData(null);
    try {
      const response = await api.post('/bookings/peak-time', {
        date: peakTimeDate,
      });
      setPeakTimeData(response.data.data);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load peak time.');
    } finally {
      setReportLoading('');
    }
  };

  useEffect(() => {
    fetchServiceOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'services') fetchServices();
    if (activeTab === 'reports') {
      fetchAnalytics();
      fetchPeakTime();
    }
    fetchServiceOptions();
  }, [activeTab]);


  const handleAddHoliday = async () => {
    if (!holidayDate) return alert("Please select a date");
    setIsSubmittingAction('holiday');
    try {
      const payloadDate = convertToSlashDate(holidayDate);
      await api.post('/staff/holiday', { date: payloadDate });
      alert('Holiday added successfully.');
    } catch (err: any) {
      console.error(err); alert('Failed to add holiday.');
    } finally { setIsSubmittingAction(null); }
  };

  const handleSetWeeklyOff = async () => {
    setIsSubmittingAction('weekly-off');
    try {
      await api.post('/staff/weekly-off', { weekday: weeklyOffDay });
      alert('Weekly off day updated successfully.');
    } catch (err: any) {
      console.error(err); alert('Failed to set weekly off.');
    } finally { setIsSubmittingAction(null); }
  };

  const handleSetWorkingHours = async () => {
    setIsSubmittingAction('hours');
    try {
      const formattedStart = convertToAmPm(workStartTime);
      const formattedEnd = convertToAmPm(workEndTime);
      
      await api.post('/staff/working-hours', { startTime: formattedStart, endTime: formattedEnd });
      alert('Working hours updated successfully.');
    } catch (err: any) {
      console.error(err); alert('Failed to update working hours.');
    } finally { setIsSubmittingAction(null); }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;

    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      await fetchBookings();
      alert(`Booking marked as ${newStatus}.`);
    } catch (err: any) {
      console.error(err);
      alert('Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const openServiceModal = (service?: Service) => {
    if (service) {
      setEditingService({ ...service });
    } else {
      setEditingService({
        name: '',
        description: '',
        category: 'Hair',
        price: 0,
        duration: 30,
        idealFor: 'Men',
        isActive: true,
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceStatusToggle = async (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    if (!service._id) return;
    const newStatus = !service.isActive;
    if (!window.confirm(`Set status to ${newStatus ? 'Active' : 'Inactive'}?`)) return;

    setActionLoading(service._id);
    try {
      await api.patch(`/services/${service._id}/status`, { isActive: newStatus });
      await fetchServices();
      alert('Status updated.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const saveService = async () => {
    if (!editingService) return;
    setActionLoading('saving');
    try {
      const { _id, ...data } = editingService;
      if (_id) {
        await api.put(`/services/${_id}`, data);
      } else {
        await api.post('/services/', data);
      }
      await fetchServices();
      setIsServiceModalOpen(false);
      alert(_id ? 'Service updated.' : 'Service created.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save service.');
    } finally {
      setActionLoading(null);
    }
  };

  const openStaffModal = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff({ ...staffMember });
    } else {
      setEditingStaff({
        name: '',
        gender: 'male',
        age: 25,
        experience: 1,
        phone: '',
        services: [],
        status: 'Active',
        leaveDays: [],
      });
    }
    setIsStaffModalOpen(true);
  };

  const handleServicesSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editingStaff) return;
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setEditingStaff({ ...editingStaff, services: selectedOptions });
  };

  const saveStaff = async () => {
    if (!editingStaff) return;
    setActionLoading('saving');
    try {
      const { _id, ...data } = editingStaff;
      if (_id) {
        await api.put(`/staff/${_id}`, data);
      } else {
        await api.post('/staff/', data);
      }
      await fetchStaff();
      setIsStaffModalOpen(false);
      alert(_id ? 'Staff updated.' : 'Staff added.');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save staff.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveDayAdd = (date: string) => {
    if (!editingStaff || !date) return;
    if (editingStaff.leaveDays.includes(date)) return alert('Date already added');
    setEditingStaff({ ...editingStaff, leaveDays: [...editingStaff.leaveDays, date] });
  };

  const handleLeaveDayRemove = (dateToRemove: string) => {
    if (!editingStaff) return;
    setEditingStaff({
      ...editingStaff,
      leaveDays: editingStaff.leaveDays.filter(d => d !== dateToRemove),
    });
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch =
      filterStatus === 'All' || booking.status.toLowerCase() === filterStatus.toLowerCase();

    let dateMatch = true;
    if (filterStartDate) dateMatch = dateMatch && booking.date >= filterStartDate;
    if (filterEndDate) dateMatch = dateMatch && booking.date <= filterEndDate;

    return statusMatch && dateMatch;
  });

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <button className="back-btn-link" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-nav">
        {(['bookings', 'staff', 'services', 'reports'] as const).map(tab => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {isLoading ? (
          <div className="loading">Loading data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {activeTab === 'bookings' && (
              <div className="tab-content">
                <div className="filters-bar">
                  <div className="filter-group">
                    <label>Status:</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="All">All</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>From:</label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={e => setFilterStartDate(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>To:</label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={e => setFilterEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="history-list-container">
                  {filteredBookings.length === 0 ? (
                    <div className="empty-state">No bookings match your filters.</div>
                  ) : (
                    filteredBookings.map(booking => (
                      <div key={booking._id} className="history-card">
                        <div className="history-info">
                          <h3>{booking.serviceId.name}</h3>
                          <p className="customer-name">Customer: {booking.customerName}</p>
                          <div className="history-meta">
                            <span className="meta-item">👤 Staff: {booking.staffId.name}</span>
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
                            <div className="booking-action-buttons">
                              <button
                                className={`cancel-btn ${actionLoading === booking._id ? 'loading' : ''}`}
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                disabled={actionLoading !== null}
                              >
                                Cancel
                              </button>

                              <button
                                className={`complete-btn ${actionLoading === booking._id ? 'loading' : ''}`}
                                onClick={() => updateBookingStatus(booking._id, 'completed')}
                                disabled={actionLoading !== null}
                              >
                                Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="tab-content">
                <div className="tab-actions">
                  <button className="btn-add" onClick={() => openServiceModal()}>
                    + Add Service
                  </button>
                </div>
                <div className="grid-list-container">
                  {services.map(service => (
                    <div
                      key={service._id}
                      className="grid-card clickable-card"
                      onClick={() => service._id && openServiceModal(service)}
                    >
                      <div className="card-header">
                        <h3>{service.name}</h3>
                        <span
                          className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="card-details">
                        <p>Category: {service.category}</p>
                        <p>Price: ${service.price}</p>
                      </div>
                      {service._id && (
                        <button
                          className="card-action-btn"
                          onClick={e => handleServiceStatusToggle(e, service)}
                          disabled={actionLoading === service._id}
                        >
                          {actionLoading === service._id
                            ? '...'
                            : service.isActive
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="tab-content">
                <div className="staff-controls-bar">
                  <div className="control-group">
                    <label>Add Holiday</label>
                    <input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} />
                    <button className="btn-small" onClick={handleAddHoliday} disabled={isSubmittingAction === 'holiday'}>Set Holiday</button>
                  </div>

                  <div className="control-group">
                    <label>Weekly Off</label>
                    <select value={weeklyOffDay} onChange={e => setWeeklyOffDay(e.target.value)}>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                    <button className="btn-small" onClick={handleSetWeeklyOff} disabled={isSubmittingAction === 'weekly-ff'}>Set Off</button>
                  </div>

                  <div className="control-group">
                    <label>Working Hours</label>
                    <div className="time-inputs">
                      <input type="time" value={workStartTime} onChange={e => setWorkStartTime(e.target.value)} />
                      <span>-</span>
                      <input type="time" value={workEndTime} onChange={e => setWorkEndTime(e.target.value)} />
                    </div>
                    <button className="btn-small" onClick={handleSetWorkingHours} disabled={isSubmittingAction === 'hours'}>Update</button>
                  </div>
                </div>

                <div className="tab-actions"><button className="btn-add" onClick={() => openStaffModal()}>+ Add Staff</button></div>
                <div className="grid-list-container">
                  {staff.map(member => (
                    <div key={member._id} className="grid-card clickable-card" onClick={() => member._id && openStaffModal(member)}>
                      <div className="card-header"><h3>{member.name}</h3><span className={`status-badge ${member.status === 'Active' ? 'active' : 'inactive'}`}>{member.status}</span></div>
                      <div className="card-details"><p>Age: {member.age} ({member.gender})</p><p>Experience: {member.experience} years</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="tab-content reports-wrapper">
                <div className="report-section">
                  <h3>Booking Analytics</h3>
                  <div className="report-controls">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={analyticsDates.start}
                      onChange={e =>
                        setAnalyticsDates({ ...analyticsDates, start: e.target.value })
                      }
                    />
                    <label>End Date</label>
                    <input
                      type="date"
                      value={analyticsDates.end}
                      onChange={e => setAnalyticsDates({ ...analyticsDates, end: e.target.value })}
                    />
                    <button
                      className="btn-primary"
                      onClick={fetchAnalytics}
                      disabled={reportLoading === 'analytics'}
                    >
                      Generate
                    </button>
                  </div>

                  {analyticsData ? (
                    <div className="report-results">
                      <div className="report-stats-grid">
                        <div className="stat-card">
                          <span className="stat-label">Total Bookings</span>
                          <span className="stat-value">{analyticsData.totalBookings}</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Completed</span>
                          <span className="stat-value success">
                            {analyticsData.statusCounts.completed}
                          </span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Pending</span>
                          <span className="stat-value warning">
                            {analyticsData.statusCounts.pending}
                          </span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Cancelled</span>
                          <span className="stat-value danger">
                            {analyticsData.statusCounts.cancelled}
                          </span>
                        </div>
                      </div>

                      <div className="busiest-times-list">
                        <h4>Busiest Times</h4>
                        {analyticsData.busiestTimes.map((item, idx) => (
                          <div key={idx} className="busiest-time-item">
                            <span>{item.time}</span>
                            <span>{item.bookings} bookings</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : reportLoading === 'analytics' ? (
                    <div className="loading">Loading...</div>
                  ) : (
                    <p>Generate report to see data.</p>
                  )}
                </div>

                <div className="report-section">
                  <h3>Daily Peak Time Analysis</h3>
                  <div className="report-controls">
                    <label>Date</label>
                    <input
                      type="date"
                      value={peakTimeDate}
                      onChange={e => setPeakTimeDate(e.target.value)}
                    />
                    <button
                      className="btn-primary"
                      onClick={fetchPeakTime}
                      disabled={reportLoading === 'peak'}
                    >
                      Analyze
                    </button>
                  </div>

                  {peakTimeData ? (
                    <div className="report-results">
                      <div className="peak-result-box">
                        <h4>
                          Peak Period:{' '}
                          <span className="highlight">{peakTimeData.peakPeriod.name}</span>
                        </h4>
                        <p>Bookings: {peakTimeData.peakPeriod.bookings}</p>
                      </div>

                      <div className="periods-bars">
                        <div className="period-bar">
                          <span>Morning ({peakTimeData.periods.morning})</span>
                          <div className="bar-bg">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(peakTimeData.periods.morning / (peakTimeData.peakPeriod.bookings || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="period-bar">
                          <span>Afternoon ({peakTimeData.periods.afternoon})</span>
                          <div className="bar-bg">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(peakTimeData.periods.afternoon / (peakTimeData.peakPeriod.bookings || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="period-bar">
                          <span>Evening ({peakTimeData.periods.evening})</span>
                          <div className="bar-bg">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(peakTimeData.periods.evening / (peakTimeData.peakPeriod.bookings || 1)) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : reportLoading === 'peak' ? (
                    <div className="loading">Loading...</div>
                  ) : (
                    <p>Select a date to analyze peak times.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {isServiceModalOpen && editingService && (
        <div className="modal-overlay" onClick={() => setIsServiceModalOpen(false)}>
          <div className="modal-container edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService._id ? 'Edit Service' : 'Add Service'}</h2>
              <button className="close-btn" onClick={() => setIsServiceModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingService.description}
                  onChange={e =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={e =>
                      setEditingService({ ...editingService, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input
                    type="number"
                    value={editingService.duration}
                    onChange={e =>
                      setEditingService({ ...editingService, duration: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ideal For</label>
                  <select
                    value={editingService.idealFor}
                    onChange={e =>
                      setEditingService({ ...editingService, idealFor: e.target.value })
                    }
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="All">All</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingService.category}
                    onChange={e =>
                      setEditingService({ ...editingService, category: e.target.value })
                    }
                  >
                    <option value="Hair">Hair</option>
                    <option value="Skin">Skin</option>
                    <option value="Nails">Nails</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Body">Body</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={saveService}
                disabled={actionLoading === 'saving'}
              >
                {actionLoading === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isStaffModalOpen && editingStaff && (
        <div className="modal-overlay" onClick={() => setIsStaffModalOpen(false)}>
          <div className="modal-container edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStaff._id ? 'Edit Staff' : 'Add Staff'}</h2>
              <button className="close-btn" onClick={() => setIsStaffModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editingStaff.name}
                    onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={editingStaff.gender}
                    onChange={e => setEditingStaff({ ...editingStaff, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={editingStaff.age}
                    onChange={e =>
                      setEditingStaff({ ...editingStaff, age: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    value={editingStaff.experience}
                    onChange={e =>
                      setEditingStaff({ ...editingStaff, experience: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editingStaff.phone}
                    onChange={e => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingStaff.status}
                    onChange={e => setEditingStaff({ ...editingStaff, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Services</label>
                <select
                  multiple
                  className="multi-select"
                  value={editingStaff.services}
                  onChange={handleServicesSelect}
                >
                  {availableServices.map(srv => (
                    <option key={srv._id} value={srv._id}>
                      {srv.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Leave Days</label>
                <div className="leave-days-editor">
                  {editingStaff.leaveDays.map(date => (
                    <div key={date} className="leave-day-tag">
                      {date}
                      <button type="button" onClick={() => handleLeaveDayRemove(date)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-date-row">
                  <input type="date" id="newLeaveDate" />
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => {
                      const input = document.getElementById('newLeaveDate') as HTMLInputElement;
                      if (input.value) handleLeaveDayAdd(input.value);
                    }}
                  >
                    Add Date
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={saveStaff}
                disabled={actionLoading === 'saving'}
              >
                {actionLoading === 'saving' ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
