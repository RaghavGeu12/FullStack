import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isFarmer = user?.role === 'farmer';
  const basePath = isFarmer ? '/farmer' : '/buyer';

  const navItems = isFarmer ? [
    { path: '/farmer/dashboard', label: 'Overview', icon: '📊' },
    { path: '/farmer/crops', label: 'My Crops', icon: '🌾' },
    { path: '/farmer/orders', label: 'Orders', icon: '📦' }
  ] : [
    { path: '/buyer/dashboard', label: 'Overview', icon: '📊' },
    { path: '/buyer/browse', label: 'Browse Crops', icon: '🛒' },
    { path: '/buyer/orders', label: 'My Orders', icon: '📦' },
    { path: '/buyer/reviews', label: 'Leave Review', icon: '⭐' }
  ];

  return (
    <>
      {/* Top Navbar */}
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
                <span className="user-role">{isFarmer ? 'Farmer' : 'Buyer'}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
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
