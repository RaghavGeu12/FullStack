const express = require('express');
const router = express.Router();
const {
  getCrops,
  getFeaturedCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  getFarmerCrops
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCrops)
  .post(protect, authorize('farmer'), createCrop);

router.get('/featured', getFeaturedCrops);
router.get('/farmer/my-crops', protect, authorize('farmer'), getFarmerCrops);

router.route('/:id')
  .get(getCropById)
  .put(protect, authorize('farmer'), updateCrop)
  .delete(protect, authorize('farmer'), deleteCrop);

module.exports = router;
