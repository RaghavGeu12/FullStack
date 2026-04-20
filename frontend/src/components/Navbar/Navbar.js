import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isFarmer = user?.role === 'farmer';
  const basePath = isFarmer ? '/farmer' : '/buyer';

  const navItems = isFarmer ? [
    { path: '/farmer/dashboard', label: t('nav.overview'), icon: '📊' },
    { path: '/farmer/crops', label: t('nav.mycrops'), icon: '🌾' },
    { path: '/farmer/orders', label: t('nav.orders'), icon: '📦' }
  ] : [
    { path: '/buyer/dashboard', label: t('nav.overview'), icon: '📊' },
    { path: '/buyer/browse', label: t('nav.browse'), icon: '🛒' },
    { path: '/buyer/orders', label: t('nav.myorders'), icon: '📦' },
    { path: '/buyer/reviews', label: t('nav.review'), icon: '⭐' }
  ];

  return (
    <>
      
      <nav className="top-navbar">
        <div className="navbar-container">
          <Link to={basePath + '/dashboard'} className="navbar-logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">AgriConnect</span>
          </Link>

          <div className="navbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">
                  {isFarmer ? t('auth.farmer') : t('auth.buyer')}
                </span>
              </div>
            </div>
            <LanguageSwitcher />
            <button className="btn-logout" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </nav>

      <aside className="side-menu">
        <div className="menu-label">MENU</div>
        <nav className="menu-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label-text">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Navbar;