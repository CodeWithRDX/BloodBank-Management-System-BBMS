import Branch from '../models/Branch.js';
import BloodInventory from '../models/BloodInventory.js';
import Camp from '../models/Camp.js';

/**
 * Calculate distance between two lat/lng points using Haversine formula (km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Find nearby blood banks within radius
// @route   GET /api/geo/nearby?lat=...&lng=...&radius=50&bloodGroup=A+
// @access  Public
export const getNearbyBranches = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50, bloodGroup } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // MongoDB geo query
    const branches = await Branch.find({
      status: 'approved',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: radiusKm * 1000, // meters
        },
      },
    }).select('name address latitude longitude phone email operatingHours');

    // For each branch, get blood stock
    const branchesWithStock = await Promise.all(
      branches.map(async (branch) => {
        const stockMatch = { status: 'available', branchId: branch._id };
        if (bloodGroup) stockMatch.bloodGroup = bloodGroup;

        const stock = await BloodInventory.aggregate([
          { $match: stockMatch },
          { $group: { _id: '$bloodGroup', units: { $sum: '$quantity' } } },
          { $sort: { _id: 1 } },
        ]);

        const distance = haversineDistance(userLat, userLng, branch.latitude, branch.longitude);

        return {
          ...branch.toObject(),
          distance: Math.round(distance * 10) / 10, // km, 1 decimal
          stock,
          hasRequestedBlood: bloodGroup ? stock.some((s) => s._id === bloodGroup && s.units > 0) : true,
        };
      })
    );

    // Sort by distance
    branchesWithStock.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: branchesWithStock.length,
      data: branchesWithStock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blood banks for map display
// @route   GET /api/geo/map
// @access  Public
export const getBloodBankMap = async (req, res, next) => {
  try {
    const { bloodGroup } = req.query;

    const branches = await Branch.find({ status: 'approved', isActive: true })
      .select('name address latitude longitude phone email operatingHours');

    const withStock = await Promise.all(
      branches.map(async (branch) => {
        const stockMatch = { status: 'available', branchId: branch._id };
        const stock = await BloodInventory.aggregate([
          { $match: stockMatch },
          { $group: { _id: '$bloodGroup', units: { $sum: '$quantity' } } },
        ]);

        const hasBlood = bloodGroup
          ? stock.some((s) => s._id === bloodGroup && s.units > 0)
          : true;

        return { ...branch.toObject(), stock, hasBlood };
      })
    );

    const filtered = bloodGroup ? withStock.filter((b) => b.hasBlood) : withStock;

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby camps for map
// @route   GET /api/geo/camps?lat=...&lng=...&radius=50
// @access  Public
export const getNearbyCamps = async (req, res, next) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;
    const radiusKm = parseFloat(radius);

    const filter = {
      status: 'upcoming',
      date: { $gte: new Date() },
    };

    let camps;
    if (userLat && userLng) {
      camps = await Camp.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [userLng, userLat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      }).populate('branchId', 'name');
    } else {
      camps = await Camp.find(filter).populate('branchId', 'name').sort({ date: 1 }).limit(20);
    }

    const result = camps.map((camp) => ({
      ...camp.toObject(),
      distance:
        userLat && userLng
          ? Math.round(haversineDistance(userLat, userLng, camp.latitude, camp.longitude) * 10) / 10
          : null,
    }));

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearest branch for a blood request
// @route   GET /api/geo/nearest-branch?lat=...&lng=...&bloodGroup=A+&quantity=2
// @access  Private
export const getNearestBranchForRequest = async (req, res, next) => {
  try {
    const { lat, lng, bloodGroup, quantity = 1 } = req.query;

    if (!lat || !lng || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and blood group are required',
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const qty = parseInt(quantity);

    const branches = await Branch.find({
      status: 'approved',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: 100000, // 100km
        },
      },
    });

    // Find first branch with sufficient stock
    for (const branch of branches) {
      const stock = await BloodInventory.aggregate([
        { $match: { branchId: branch._id, bloodGroup, status: 'available' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]);

      const available = stock[0]?.total || 0;
      if (available >= qty) {
        const distance = haversineDistance(userLat, userLng, branch.latitude, branch.longitude);
        return res.status(200).json({
          success: true,
          data: { branch, distance: Math.round(distance * 10) / 10, available },
        });
      }
    }

    res.status(200).json({ success: true, data: null, message: 'No nearby branch with sufficient stock found' });
  } catch (error) {
    next(error);
  }
};
