import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './AddCrop.css';

const AddCrop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.quantity || !formData.location || !formData.state) {
      toast.error(t('addCrop.errorRequired'));
      return;
    }

    if (formData.price <= 0 || formData.quantity <= 0) {
      toast.error(t('addCrop.errorPrice'));
      return;
    }

    setLoading(true);

    try {
      await api.post('/crops', {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity)
      });

      toast.success(t('addCrop.successMsg'));
      navigate('/farmer/crops');
    } catch (error) {
      toast.error(error.response?.data?.message || t('addCrop.errorFailed'));
      setLoading(false);
    }
  };

  return (
    <div className="add-crop-page">
      <Navbar />

      <div className="add-crop-container">
        <div className="add-crop-header">
          <button className="btn-back" onClick={() => navigate('/farmer/dashboard')}>
            {t('addCrop.back')}
          </button>
          <h1 className="page-title">{t('addCrop.title')}</h1>
          <p className="page-subtitle">{t('addCrop.subtitle')}</p>
        </div>

        <div className="add-crop-card">
          <form onSubmit={handleSubmit} className="crop-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">{t('addCrop.cropName')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('addCrop.cropNamePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">{t('addCrop.category')}</label>
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
                <label htmlFor="price">{t('addCrop.price')}</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t('addCrop.pricePlaceholder')}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">{t('addCrop.quantity')}</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder={t('addCrop.quantityPlaceholder')}
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">{t('addCrop.location')}</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('addCrop.locationPlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">{t('addCrop.state')}</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('addCrop.selectState')}</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('addCrop.description')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('addCrop.descriptionPlaceholder')}
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/farmer/dashboard')}
              >
                {t('addCrop.cancel')}
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? t('addCrop.adding') : t('addCrop.addBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCrop;