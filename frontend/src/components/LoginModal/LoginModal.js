import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './LoginModal.css';

const LoginModal = ({ type, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '', email: '', password: '', phone: '', address: '', state: ''
  });

  const isFarmer = type === 'farmer';
  const demoEmail = isFarmer ? 'farmer@demo.com' : 'buyer@demo.com';
  const demoPassword = 'demo123';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(signInData.email, signInData.password, type);
    setLoading(false);
    if (result.success) {
      onClose();
      navigate(isFarmer ? '/farmer/dashboard' : '/buyer/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({ ...signUpData, role: type });
    setLoading(false);
    if (result.success) {
      onClose();
      navigate(isFarmer ? '/farmer/dashboard' : '/buyer/dashboard');
    } else {
      setError(result.message);
    }
  };

  const useDemoCredentials = () => {
    setSignInData({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${isFarmer ? 'farmer-modal' : 'buyer-modal'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <span className="modal-icon">{isFarmer ? '🌱' : '🛒'}</span>
          <span className="modal-badge">
            {isFarmer ? t('loginModal.farmerPortal') : t('loginModal.buyerPortal')}
          </span>
          <h2 className="modal-title">{t('loginModal.welcomeBack')}</h2>
          <p className="modal-subtitle">
            {isFarmer ? t('loginModal.farmerSubtitle') : t('loginModal.buyerSubtitle')}
          </p>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            {t('loginModal.signIn')}
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {t('loginModal.register')}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'signin' ? (
          <form className="modal-form" onSubmit={handleSignIn}>
            <div className="form-group">
              <label>{t('loginModal.emailLabel')}</label>
              <input
                type="email"
                placeholder={t('loginModal.emailPlaceholder')}
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.passwordLabel')}</label>
              <input
                type="password"
                placeholder={t('loginModal.passwordPlaceholder')}
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? t('loginModal.signingIn')
                : t('loginModal.signInBtn', {
                    role: isFarmer ? t('auth.farmer') : t('auth.buyer')
                  })}
            </button>

            <div className="demo-credentials">
              <p className="demo-label">{t('loginModal.demoCredentials')}</p>
              <p className="demo-info">
                {t('loginModal.demoInfo', { email: demoEmail, password: demoPassword })}
              </p>
              <button type="button" className="btn-demo" onClick={useDemoCredentials}>
                {t('loginModal.useDemoBtn')}
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label>{t('loginModal.fullNameLabel')}</label>
              <input
                type="text"
                placeholder={t('loginModal.fullNamePlaceholder')}
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.emailLabel')}</label>
              <input
                type="email"
                placeholder={t('loginModal.emailRegPlaceholder')}
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.passwordLabel')}</label>
              <input
                type="password"
                placeholder={t('loginModal.passwordRegPlaceholder')}
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.phoneLabel')}</label>
              <input
                type="tel"
                placeholder={t('loginModal.phonePlaceholder')}
                value={signUpData.phone}
                onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.addressLabel')}</label>
              <input
                type="text"
                placeholder={t('loginModal.addressPlaceholder')}
                value={signUpData.address}
                onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>{t('loginModal.stateLabel')}</label>
              <input
                type="text"
                placeholder={t('loginModal.statePlaceholder')}
                value={signUpData.state}
                onChange={(e) => setSignUpData({ ...signUpData, state: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? t('loginModal.creatingAccount') : t('loginModal.createAccount')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;