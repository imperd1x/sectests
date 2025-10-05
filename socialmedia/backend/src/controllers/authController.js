const jwt = require('jsonwebtoken');
const pool = require('../utils/db');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const next = req.query.next || req.body.next; // VULN: notifications screen will trust this on the client for open redirect.

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.blocked) {
      return res.status(403).json({ message: 'Account blocked' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'devsecret', {
      expiresIn: '1h'
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json({ message: 'Logged in', user: { id: user.id, email: user.email, role: user.role }, next });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
