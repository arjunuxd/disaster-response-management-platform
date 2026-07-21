const Report = require('../models/Report');
const Alert = require('../models/Alert');
const RiskZone = require('../models/RiskZone');

const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: { reports: [], alerts: [], riskZones: [] } });
    }

    const escapedQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = { $regex: escapedQuery, $options: 'i' };

    const [reports, alerts, riskZones] = await Promise.all([
      Report.find({
        $or: [
          { title: regex },
          { district: regex },
          { address: regex },
          { description: regex },
        ],
      })
        .populate('reportedBy', 'fullName')
        .populate('reportType', 'name')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean(),
      Alert.find({
        $or: [
          { title: regex },
          { message: regex },
          { affectedDistricts: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean(),
      RiskZone.find({
        $or: [
          { name: regex },
          { district: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { reports, alerts, riskZones },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
