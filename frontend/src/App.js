import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import LandingPage from './components/LandingPage/LandingPage';
import BuyerDashboard from './components/BuyerDashboard/BuyerDashboard';
import BrowseCrops from './components/BrowseCrops/BrowseCrops';
import MyOrders from './components/MyOrders/MyOrders';
import FarmerDashboard from './components/FarmerDashboard/FarmerDashboard';
import AddCrop from './components/AddCrop/AddCrop';
import ManageCrops from './components/ManageCrops/ManageCrops';
import FarmerOrders from './components/FarmerOrders/FarmerOrders';
import PlaceOrder from './components/PlaceOrder/PlaceOrder';
import LeaveReview from './components/LeaveReview/LeaveReview';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <LandingPage />
          )
        } 
      />

      {/* Buyer Routes */}
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/browse"
        element={
          <ProtectedRoute allowedRole="buyer">
            <BrowseCrops />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/orders"
        element={
          <ProtectedRoute allowedRole="buyer">
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/order/:cropId"
        element={
          <ProtectedRoute allowedRole="buyer">
            <PlaceOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer/reviews"
        element={
          <ProtectedRoute allowedRole="buyer">
            <LeaveReview />
          </ProtectedRoute>
        }
      />

      {/* Farmer Routes */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRole="farmer">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/crops"
        element={
          <ProtectedRoute allowedRole="farmer">
            <ManageCrops />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/crops/new"
        element={
          <ProtectedRoute allowedRole="farmer">
            <AddCrop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute allowedRole="farmer">
            <FarmerOrders />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>        {/* ✅ AuthProvider now wraps Router */}
      <Router>
        <div className="App">
          <AppRoutes />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;