const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(logger);
app.use(rateLimiter);

app.get('/', (req, res) => {
  res.json({ status: 'insecure-social-backend', message: 'This API is intentionally vulnerable. Do not expose publicly.' });
});

app.use('/api', require('./routes'));

app.use('/static-photos', express.static(path.join(__dirname, '../uploads')));

app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
