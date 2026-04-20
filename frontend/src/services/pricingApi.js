import api from '../utils/api';

export async function fetchSuggestedPrice(cropName, harvestDate) {
  try {
    const { data } = await api.get('/crops/suggest-price', {
      params: { cropName, harvestDate }
    });
    return data;
  } catch (error) {
    console.error('Price suggestion error:', error);
    return null;
  }
}