const hits = new Map();

const rateLimiter = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const windowMs = 1000;
  const maxHits = 20;

  if (!hits.has(key)) {
    hits.set(key, []);
  }

  const timestamps = hits.get(key).filter((ts) => now - ts < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);

  if (timestamps.length > maxHits) {
    // VULN: simplistic rate limiter can be bypassed by rotating IPs or waiting slightly.
    return res.status(429).json({ message: 'Slow down' });
  }

  next();
};

module.exports = rateLimiter;
