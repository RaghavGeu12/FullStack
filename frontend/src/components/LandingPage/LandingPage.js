import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';
import LoginModal from '../LoginModal/LoginModal';
import LanguageSwitcher from '../LanguageSwitcher';
import logo from '../../assets/logo.png';

const LandingPage = () => {
  const { t } = useTranslation();
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
      <header className="landing-header">
        <div className="header-container">
          <img src={logo} alt="AgriConnect Logo" className="logo" />
          {/* ✅ Language switcher added to landing page header */}
          <div className="header-lang-switcher">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-inner">
              <img src={logo} alt="AgriConnect" className="badge-logo" />
            </div>
          </div>

          <h1 className="hero-title">{t('landingPage.heroTitle')}</h1>
          <p className="hero-subtitle">{t('landingPage.heroSubtitle')}</p>

          <div className="login-section">
            <div className="login-card">
              <div className="login-card-content">
                <div className="login-icon">🌾</div>
                <h2>{t('landingPage.farmerLoginTitle')}</h2>
                <p>{t('landingPage.farmerLoginDesc')}</p>
              </div>
              <button className="login-btn" onClick={() => handleOpenModal('farmer')}>
                {t('landingPage.farmerLoginBtn')}
              </button>
            </div>

            <div className="login-card">
              <div className="login-card-content">
                <div className="login-icon">🛒</div>
                <h2>{t('landingPage.buyerLoginTitle')}</h2>
                <p>{t('landingPage.buyerLoginDesc')}</p>
              </div>
              <button className="login-btn" onClick={() => handleOpenModal('buyer')}>
                {t('landingPage.buyerLoginBtn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section">
        <h2 className="services-title">{t('landingPage.servicesTitle')}</h2>
        <div className="service-grid">
          <div className="service-item">
            <div className="service-image-wrapper">
              <div className="service-image ecommerce-image">🌐</div>
            </div>
            <div className="service-content">
              <h3>{t('landingPage.ecommerceTitle')}</h3>
              <p>{t('landingPage.ecommerceDesc')}</p>
            </div>
          </div>

          <div className="service-item reverse">
            <div className="service-image-wrapper">
              <div className="service-image support-image">🤝</div>
            </div>
            <div className="service-content">
              <h3>{t('landingPage.supportTitle')}</h3>
              <p>{t('landingPage.supportDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <LoginModal type={modalType} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default LandingPage;