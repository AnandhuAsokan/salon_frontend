import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ServicePage.css';

interface StaffService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Staff {
  _id: string;
  name: string;
  age: number;
  gender: string;
  ratings: number[];
  reviews: string[];
  services: StaffService[];
  status: string;
}

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [selectedService, setSelectedService] = useState<StaffService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffs = async () => {
        console.log("serviceId",serviceId);
      if (!serviceId) return;
      try {
        const response = await api.get(`/staff/staff/${serviceId}`);
        const staffData = response.data.data;
        setStaffs(staffData);

        if (staffData.length > 0 && staffData[0].services.length > 0) {
          const serviceInfo = staffData[0].services.find((s:any) => s._id === serviceId);
          setSelectedService(serviceInfo || staffData[0].services[0]);
        }

      } catch (err: any) {
        setError('Failed to load staff details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffs();
  }, [serviceId]);

  const getAverageRating = (ratings: number[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (ratings: number[]) => {
    const avg = parseFloat(getAverageRating(ratings as number[]).toString());
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= avg) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const handleSelectStaff = (staffId: string) => {
    console.log(`Selected Staff ID: ${staffId}`);
    alert(`Staff selected! ID: ${staffId}. Here you would call your next API.`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) return <div className="loading">Loading availability...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="service-detail-page">
      <button className="back-btn" onClick={handleBack}>← Back to Services</button>
      
      {selectedService && (
        <div className="service-header-detail">
          <h1>{selectedService.name}</h1>
          <p className="service-desc">{selectedService.description}</p>
          <div className="service-tags">
            <span className="tag">⏱ {selectedService.duration} mins</span>
            <span className="tag">💵 ${selectedService.price}</span>
            <span className="tag">{selectedService.category}</span>
          </div>
        </div>
      )}

      <h2 className="staff-section-title">Available Professionals</h2>

      <div className="staff-grid">
        {staffs.map((staff) => (
          <div key={staff._id} className="staff-card">
            <div className="staff-header">
                <img 
                    src={`https://ui-avatars.com/api/?name=${staff.name}&background=random&color=fff`} 
                    alt={staff.name} 
                    className="staff-avatar"
                />
                <div>
                    <h3 className="staff-name">{staff.name}</h3>
                    <span className="staff-meta">Age: {staff.age} • {staff.gender}</span>
                </div>
            </div>

            <div className="staff-rating-section">
                <div className="stars">
                    {renderStars(staff.ratings)} 
                    <span className="rating-text">
                        {staff.ratings.length > 0 ? `(${getAverageRating(staff.ratings)})` : '(No reviews yet)'}
                    </span>
                </div>
            </div>

            {staff.reviews && staff.reviews.length > 0 && (
                <div className="staff-review-snippet">
                    <p>"{staff.reviews[staff.reviews.length - 1]}"</p>
                </div>
            )}

            <button 
                className="select-staff-btn"
                onClick={() => handleSelectStaff(staff._id)}
            >
                Select {staff.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetailPage;