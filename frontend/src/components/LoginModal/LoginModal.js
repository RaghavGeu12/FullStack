import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ type, onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    state: ''
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

    const result = await register({
      ...signUpData,
      role: type
    });
    
    setLoading(false);
    
    if (result.success) {
      onClose();
      navigate(isFarmer ? '/farmer/dashboard' : '/buyer/dashboard');
    } else {
      setError(result.message);
    }
  };

  const useDemoCredentials = () => {
    setSignInData({
      email: demoEmail,
      password: demoPassword
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${isFarmer ? 'farmer-modal' : 'buyer-modal'}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <span className="modal-icon">{isFarmer ? '🌱' : '🛒'}</span>
          <span className="modal-badge">{isFarmer ? 'FARMER PORTAL' : 'BUYER PORTAL'}</span>
          <h2 className="modal-title">Welcome Back</h2>
          <p className="modal-subtitle">
            {isFarmer 
              ? 'Manage your crops, track orders, get fair prices.' 
              : 'Browse fresh crops, place orders, review farmers.'}
          </p>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'signin' ? (
          <form className="modal-form" onSubmit={handleSignIn}>
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="buyer@example.com"
                value={signInData.email}
                onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input
                type="password"
                placeholder="Your password"
                value={signInData.password}
                onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing in...' : `Sign In as ${isFarmer ? 'Farmer' : 'Buyer'}`} →
            </button>

            <div className="demo-credentials">
              <p className="demo-label">Demo Credentials</p>
              <p className="demo-info">
                Email: <strong>{demoEmail}</strong> | Password: <strong>{demoPassword}</strong>
              </p>
              <button 
                type="button" 
                className="btn-demo"
                onClick={useDemoCredentials}
              >
                Use Demo Credentials
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                placeholder="John Doe"
                value={signUpData.name}
                onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={signUpData.email}
                onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input
                type="password"
                placeholder="Create password (min 6 characters)"
                value={signUpData.password}
                onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>PHONE NUMBER</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={signUpData.phone}
                onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>ADDRESS</label>
              <input
                type="text"
                placeholder="Your address"
                value={signUpData.address}
                onChange={(e) => setSignUpData({...signUpData, address: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>STATE</label>
              <input
                type="text"
                placeholder="e.g., Punjab, Maharashtra"
                value={signUpData.state}
                onChange={(e) => setSignUpData({...signUpData, state: e.target.value})}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} →
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;