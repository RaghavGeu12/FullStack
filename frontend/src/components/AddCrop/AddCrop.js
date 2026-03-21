import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './AddCrop.css';

const AddCrop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    state: '',
    description: ''
  });

  const categories = ['Grains', 'Vegetables', 'Fruits', 'Oilseeds'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.quantity || !formData.location || !formData.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0 || formData.quantity <= 0) {
      toast.error('Price and quantity must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      await api.post('/crops', {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity)
      });

      toast.success('Crop added successfully!');
      navigate('/farmer/crops');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add crop');
      setLoading(false);
    }
  };

  return (
    <div className="add-crop-page">
      <Navbar />
      
      <div className="add-crop-container">
        <div className="add-crop-header">
          <button className="btn-back" onClick={() => navigate('/farmer/dashboard')}>
            ← Back
          </button>
          <h1 className="page-title">Add New Crop</h1>
          <p className="page-subtitle">List your agricultural products for buyers</p>
        </div>

        <div className="add-crop-card">
          <form onSubmit={handleSubmit} className="crop-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Crop Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Wheat, Rice, Tomato"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price per kg (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity (kg) *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location/City *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Ludhiana, Mumbai"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about your crop quality, farming methods, etc."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => navigate('/farmer/dashboard')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Crop'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCrop;