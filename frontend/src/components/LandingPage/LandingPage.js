import React, { useState } from 'react';
import './LandingPage.css';
import LoginModal from '../LoginModal/LoginModal';
import logo from '../../assets/logo.png';

const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <img src={logo} alt="AgriConnect Logo" className="logo" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          {/* AgriConnect Badge */}
          <div className="hero-badge">
            <div className="badge-inner">
              <img src={logo} alt="AgriConnect" className="badge-logo" />
            </div>
          </div>
          
          <h1 className="hero-title">Welcome to Agri-Connect</h1>
          <p className="hero-subtitle">Seeding the Future with Technological Agriculture</p>
          
          {/* Login Cards */}
          <div className="login-section">
            <div className="login-card">
              <div className="login-card-content">
                <div className="login-icon">🌾</div>
                <h2>Farmer Login</h2>
                <p>Connect directly with buyers, showcase your produce, and grow your agricultural business with our platform.</p>
              </div>
              <button 
                className="login-btn"
                onClick={() => handleOpenModal('farmer')}
              >
                Login as Farmer
              </button>
            </div>
            
            <div className="login-card">
              <div className="login-card-content">
                <div className="login-icon">🛒</div>
                <h2>Buyer Login</h2>
                <p>Access fresh, locally-sourced agricultural products directly from farmers. Quality you can trust.</p>
              </div>
              <button 
                className="login-btn"
                onClick={() => handleOpenModal('buyer')}
              >
                Login as Buyer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <h2 className="services-title">Our Services</h2>
        <div className="service-grid">
          <div className="service-item">
            <div className="service-image-wrapper">
              <div className="service-image ecommerce-image">🌐</div>
            </div>
            <div className="service-content">
              <h3>E-commerce Website</h3>
              <p>Welcome to our online marketplace, where the bounties of the earth meet the convenience of the digital age! Step into a world where the soil's richness, the sun's warmth, and the dedication of local farmers converge to bring you the freshest, most wholesome agricultural products right to your doorstep.</p>
            </div>
          </div>
          
          <div className="service-item reverse">
            <div className="service-image-wrapper">
              <div className="service-image support-image">🤝</div>
            </div>
            <div className="service-content">
              <h3>Support to Local Farmers</h3>
              <p>We believe in transparency and accountability every step of the way, from the farm to your table. That's why we work closely with local farmers who share our values, ensuring that each item is grown and harvested with the utmost care and attention to detail.</p>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <LoginModal 
          type={modalType} 
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default LandingPage;