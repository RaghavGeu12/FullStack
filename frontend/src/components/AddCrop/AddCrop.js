import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import { fetchSuggestedPrice } from '../../services/pricingApi'; // ADDED
import './AddCrop.css';

const AddCrop = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);      // ADDED
  const [priceSuggestion, setPriceSuggestion] = useState(null); // ADDED
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grains',
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    state: '',
    description: '',
    harvestMonth: '' // ADDED — format: "YYYY-MM"
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
    // Reset suggestion whenever crop name or harvest month changes
    if (e.target.name === 'name' || e.target.name === 'harvestMonth') {
      setPriceSuggestion(null); // ADDED
    }
  };

  // ADDED — fetches suggested price from backend
  const handleSuggestPrice = async () => {
    if (!formData.name) {
      toast.error('Please enter a crop name first');
      return;
    }
    if (!formData.harvestMonth) {
      toast.error('Please select the harvest month first');
      return;
    }

    // Convert "YYYY-MM" to a full date string "YYYY-MM-01" for the backend
    const harvestDate = `${formData.harvestMonth}-01`;

    setPriceLoading(true);
    setPriceSuggestion(null);

    const result = await fetchSuggestedPrice(formData.name, harvestDate);

    if (result && result.suggestedPrice) {
      setPriceSuggestion(result);
    } else {
      toast.info('No market data found for this crop. Please enter price manually.');
    }

    setPriceLoading(false);
  };

  // ADDED — applies the suggested price into the price field
  const handleApplyPrice = () => {
    setFormData(prev => ({ ...prev, price: priceSuggestion.suggestedPrice }));
    toast.success('Suggested price applied!');
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

            {/* Row 1 — crop name + category (unchanged) */}
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

            {/* ADDED — Row 2: harvest month + suggest price button */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="harvestMonth">Harvest Month</label>
                <input
                  type="month"
                  id="harvestMonth"
                  name="harvestMonth"
                  value={formData.harvestMonth}
                  onChange={handleChange}
                  max={new Date().toISOString().slice(0, 7)}
                />
                <span className="field-hint">
                  When was this crop harvested? Used to calculate market price.
                </span>
              </div>

              <div className="form-group suggest-price-group">
                <label>Smart Price Suggestion</label>
                <button
                  type="button"
                  className="btn-suggest-price"
                  onClick={handleSuggestPrice}
                  disabled={priceLoading}
                >
                  {priceLoading ? 'Checking market...' : 'Get Suggested Price'}
                </button>
                <span className="field-hint">
                  Based on recent orders + seasonal adjustment
                </span>
              </div>
            </div>

            {/* ADDED — price suggestion result box */}
            {priceSuggestion && (
  <div className="price-suggestion-box">
    <div className="price-suggestion-left">

      {/* How price was sourced */}
      <span className="suggestion-label">{priceSuggestion.method}</span>

      {/* Final suggested price */}
      <span className="suggestion-amount">
        ₹{priceSuggestion.suggestedPrice}
        <span className="suggestion-unit"> / {formData.unit}</span>
      </span>

      {/* Calculation breakdown */}
      {priceSuggestion.breakdown ? (
        <div className="suggestion-breakdown">
          <span className="breakdown-row">
            Base price &nbsp;<strong>₹{priceSuggestion.basePrice}</strong>
          </span>
          <span className="breakdown-row">
            Seasonal increase &nbsp;
            <strong>{priceSuggestion.breakdown}</strong>
          </span>
          <span className="breakdown-row breakdown-total">
            Suggested &nbsp;<strong>₹{priceSuggestion.suggestedPrice}</strong>
          </span>
        </div>
      ) : (
        <span className="suggestion-base">
          Harvested this month — no seasonal adjustment applied
        </span>
      )}

    </div>
    <button
      type="button"
      className="btn-apply-price"
      onClick={handleApplyPrice}
    >
      Use this price
    </button>
  </div>
)}

            {/* Row 3 — price + quantity (unchanged) */}
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

            {/* Row 4 — location + state (unchanged) */}
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

            {/* Description (unchanged) */}
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

            {/* Form actions (unchanged) */}
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