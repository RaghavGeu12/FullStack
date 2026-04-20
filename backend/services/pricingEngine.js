const mspData = require('./msp.json');
const Order = require('../models/Order');

function getAveragePrice(orders) {
  if (!orders || orders.length === 0) return null;
  const total = orders.reduce((sum, o) => sum + o.totalPrice / o.quantity, 0);
  return total / orders.length;
}

function filterOrdersByDays(allOrders, fromDays, toDays = 0) {
  const now = Date.now();
  const MS_PER_DAY = 86400000;
  return allOrders.filter(order => {
    const age = (now - new Date(order.orderDate).getTime()) / MS_PER_DAY;
    return age >= toDays && age <= fromDays;
  });
}

// CHANGED — simple interest formula instead of compound
function applySeasonalIncrease(basePrice, harvestDate) {
  const now = new Date();
  const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
  const monthsElapsed = (now - new Date(harvestDate)) / msPerMonth;

  if (monthsElapsed <= 0) {
    return {
      suggestedPrice: parseFloat(basePrice.toFixed(2)),
      increase: 0,
      monthsElapsed: 0
    };
  }

  // Simple: basePrice × 2% × months
  const increase = parseFloat((basePrice * 0.02 * monthsElapsed).toFixed(2));
  const suggestedPrice = parseFloat((basePrice + increase).toFixed(2));

  return {
    suggestedPrice,
    increase,
    monthsElapsed: parseFloat(monthsElapsed.toFixed(2))
  };
}

async function suggestPrice(cropName, harvestDate) {
  const cropKey = cropName.toLowerCase().trim();

  const allOrders = await Order.find({
    cropName: { $regex: new RegExp(`^${cropKey}$`, 'i') },
    status: 'completed'
  }).select('totalPrice quantity orderDate').lean();

  let basePrice = null;
  let method = '';

  // Tier 1 — last 10 days
  const recent = filterOrdersByDays(allOrders, 10);
  basePrice = getAveragePrice(recent);
  if (basePrice !== null) {
    method = 'Based on last 10 days market orders';
  }

  // Tier 2 — 30 to 90 days
  if (basePrice === null) {
    const midRange = filterOrdersByDays(allOrders, 90, 30);
    basePrice = getAveragePrice(midRange);
    if (basePrice !== null) {
      method = 'Based on 30–90 days market orders';
    }
  }

  // Tier 3 — Government MSP
  if (basePrice === null) {
    if (!mspData[cropKey]) {
      return {
        suggestedPrice: null,
        basePrice: null,
        increase: 0,
        monthsElapsed: 0,
        method: 'No data available',
        breakdown: null
      };
    }
    basePrice = parseFloat(mspData[cropKey]);
    method = 'Based on Government MSP';
  }

  basePrice = parseFloat(basePrice.toFixed(2));
  const seasonal = applySeasonalIncrease(basePrice, harvestDate);

  return {
    suggestedPrice: seasonal.suggestedPrice,
    basePrice,
    increase: seasonal.increase,
    monthsElapsed: seasonal.monthsElapsed,
    method,
    // Full breakdown string shown in UI
    breakdown: seasonal.monthsElapsed > 0
      ? `₹${basePrice} × 2% × ${seasonal.monthsElapsed} months = +₹${seasonal.increase}`
      : null
  };
}

module.exports = { suggestPrice };