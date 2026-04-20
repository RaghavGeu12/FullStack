const Crop = require('../models/Crop');
const { suggestPrice } = require('../services/pricingEngine'); // ADDED


const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find()
      .populate('farmer', 'name email phone avgRating avgQualityRating avgCostRating totalReviews');

    const cropsWithRating = crops.map((crop) => ({
      ...crop.toObject(),
      farmerAvgRating:        crop.farmer?.avgRating        ?? 0,
      farmerAvgQualityRating: crop.farmer?.avgQualityRating ?? 0,
      farmerAvgCostRating:    crop.farmer?.avgCostRating    ?? 0,
      farmerTotalReviews:     crop.farmer?.totalReviews     ?? 0,
    }));

    res.json(cropsWithRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getFeaturedCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ status: 'Available' })
      .limit(6)
      .populate('farmer', 'name email phone avgRating avgQualityRating avgCostRating totalReviews');

    const cropsWithRating = crops.map((crop) => ({
      ...crop.toObject(),
      farmerAvgRating:        crop.farmer?.avgRating        ?? 0,
      farmerAvgQualityRating: crop.farmer?.avgQualityRating ?? 0,
      farmerAvgCostRating:    crop.farmer?.avgCostRating    ?? 0,
      farmerTotalReviews:     crop.farmer?.totalReviews     ?? 0,
    }));

    res.json(cropsWithRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name email phone avgRating avgQualityRating avgCostRating totalReviews');

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const cropObj = {
      ...crop.toObject(),
      farmerAvgRating:        crop.farmer?.avgRating        ?? 0,
      farmerAvgQualityRating: crop.farmer?.avgQualityRating ?? 0,
      farmerAvgCostRating:    crop.farmer?.avgCostRating    ?? 0,
      farmerTotalReviews:     crop.farmer?.totalReviews     ?? 0,
    };

    res.json(cropObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createCrop = async (req, res) => {
  try {
    const { name, category, price, quantity, unit, location, state, description, image } = req.body;

    const crop = await Crop.create({
      name,
      category,
      price,
      quantity,
      unit,
      location,
      state,
      description,
      image,
      farmer: req.user._id,
      farmerName: req.user.name
    });

    res.status(201).json(crop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this crop' });
    }

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCrop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this crop' });
    }

    await crop.deleteOne();
    res.json({ message: 'Crop removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getFarmerCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user._id });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADDED — dynamic pricing suggestion endpoint
const getSuggestedPrice = async (req, res) => {
  try {
    const { cropName, harvestDate } = req.query;

    if (!cropName || !harvestDate) {
      return res.status(400).json({ message: 'cropName and harvestDate are required' });
    }

    const result = await suggestPrice(cropName, harvestDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getCrops,
  getFeaturedCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  getFarmerCrops,
  getSuggestedPrice  // ADDED
};