console.log('[DEV BYPASS] loaded - allowing dev access with Bearer dev');

module.exports = async function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  
  if (token === 'dev') {
    // Grant pro tier access for development
    req.user = { sub: 'dev-user', name: 'Developer' };
    req.tier = 'pro';
    console.log('[DEV BYPASS] Granted pro tier access to dev user');
    return next();
  }
  
  // For any other token, reject
  return res.status(401).json({ error: 'Invalid token format' });
}; 