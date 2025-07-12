console.log('[ACTIVE AUTH] loaded');

const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'dev-secret';

module.exports = async function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token || token.split('.').length !== 3) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('tier')
    .eq('id', payload.sub)
    .single();

  if (!profile) return res.status(403).json({ error: 'User profile not found' });

  req.user = payload;
  req.tier = profile.tier;
  next();
};
