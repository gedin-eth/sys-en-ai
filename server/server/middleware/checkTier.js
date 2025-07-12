const { tiers } = require('../pricing');

module.exports = (feature) => (req, res, next) => {
  const tier = req.tier || 'free';
  if (!tiers[tier]?.[feature]) {
    return res.status(403).json({ error: `Feature '${feature}' not available for tier '${tier}'` });
  }
  next();
};
