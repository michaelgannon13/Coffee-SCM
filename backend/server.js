const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ==================== ROUTES ====================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, cooperative_id: user.cooperative_id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        cooperative_id: user.cooperative_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Cooperatives: Get all
app.get('/api/cooperatives', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cooperatives ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cooperatives:', error);
    res.status(500).json({ error: 'Failed to fetch cooperatives' });
  }
});

// Cooperatives: Get by ID
app.get('/api/cooperatives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cooperatives WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cooperative not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching cooperative:', error);
    res.status(500).json({ error: 'Failed to fetch cooperative' });
  }
});

// Farmers: Get all (with optional cooperative filter)
app.get('/api/farmers', async (req, res) => {
  try {
    const { cooperative_id } = req.query;
    
    let query = `
      SELECT f.*, c.name as cooperative_name 
      FROM farmers f
      LEFT JOIN cooperatives c ON f.cooperative_id = c.id
    `;
    const params = [];
    
    if (cooperative_id) {
      query += ' WHERE f.cooperative_id = $1';
      params.push(cooperative_id);
    }
    
    query += ' ORDER BY f.last_name, f.first_name';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
});

// Farmers: Get by ID
app.get('/api/farmers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT f.*, c.name as cooperative_name 
      FROM farmers f
      LEFT JOIN cooperatives c ON f.cooperative_id = c.id
      WHERE f.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ error: 'Failed to fetch farmer' });
  }
});

// Farmers: Create
app.post('/api/farmers', authenticateToken, async (req, res) => {
  try {
    const { cooperative_id, farmer_code, first_name, last_name, phone, farm_location, farm_size_hectares, certification } = req.body;
    
    const result = await pool.query(`
      INSERT INTO farmers (cooperative_id, farmer_code, first_name, last_name, phone, farm_location, farm_size_hectares, certification)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [cooperative_id, farmer_code, first_name, last_name, phone, farm_location, farm_size_hectares, certification]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating farmer:', error);
    res.status(500).json({ error: 'Failed to create farmer' });
  }
});

// Harvest Batches: Get all (with filters)
app.get('/api/batches', async (req, res) => {
  try {
    const { cooperative_id, farmer_id, status } = req.query;
    
    let query = `
      SELECT hb.*, 
             f.first_name || ' ' || f.last_name as farmer_name,
             f.farmer_code,
             c.name as cooperative_name
      FROM harvest_batches hb
      LEFT JOIN farmers f ON hb.farmer_id = f.id
      LEFT JOIN cooperatives c ON hb.cooperative_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (cooperative_id) {
      query += ` AND hb.cooperative_id = $${paramCount}`;
      params.push(cooperative_id);
      paramCount++;
    }
    
    if (farmer_id) {
      query += ` AND hb.farmer_id = $${paramCount}`;
      params.push(farmer_id);
      paramCount++;
    }
    
    if (status) {
      query += ` AND hb.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY hb.harvest_date DESC, hb.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// Harvest Batches: Get by ID or batch code
app.get('/api/batches/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const result = await pool.query(`
      SELECT hb.*, 
             f.first_name || ' ' || f.last_name as farmer_name,
             f.farmer_code,
             f.farm_location,
             f.certification,
             c.name as cooperative_name,
             c.location as cooperative_location,
             c.country
      FROM harvest_batches hb
      LEFT JOIN farmers f ON hb.farmer_id = f.id
      LEFT JOIN cooperatives c ON hb.cooperative_id = c.id
      WHERE hb.id = $1 OR hb.batch_code = $1
    `, [identifier]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching batch:', error);
    res.status(500).json({ error: 'Failed to fetch batch' });
  }
});

// Harvest Batches: Create
app.post('/api/batches', authenticateToken, async (req, res) => {
  try {
    const { farmer_id, cooperative_id, harvest_date, quantity_kg, quality_grade, variety, processing_method, notes } = req.body;
    
    // Generate batch code
    const batch_code = `BATCH-${cooperative_id}-${farmer_id}-${Date.now()}`;
    
    const result = await pool.query(`
      INSERT INTO harvest_batches (batch_code, farmer_id, cooperative_id, harvest_date, quantity_kg, quality_grade, variety, processing_method, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [batch_code, farmer_id, cooperative_id, harvest_date, quantity_kg, quality_grade, variety, processing_method, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create batch' });
  }
});

// QR Code: Generate for batch
app.get('/api/batches/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get batch info
    const batchResult = await pool.query('SELECT * FROM harvest_batches WHERE id = $1', [id]);
    
    if (batchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    const batch = batchResult.rows[0];
    
    // Generate QR code (linking to batch detail page)
    const qrData = `${process.env.APP_URL || 'http://localhost:3000'}/batch/${batch.batch_code}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    
    // Update batch with QR code URL
    await pool.query(
      'UPDATE harvest_batches SET qr_code_url = $1 WHERE id = $2',
      [qrCodeDataURL, id]
    );
    
    res.json({ qr_code: qrCodeDataURL, batch_code: batch.batch_code });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Coffee Price: Get current NY-C price (mock data for now)
app.get('/api/coffee-price', async (req, res) => {
  try {
    // In production, integrate with real commodity price API
    // For demo, return mock data with realistic fluctuation
    const basePrice = 2.15; // USD per pound
    const variation = (Math.random() - 0.5) * 0.1;
    const currentPrice = (basePrice + variation).toFixed(4);
    
    res.json({
      market: 'New York C (Arabica)',
      price_usd_per_lb: parseFloat(currentPrice),
      price_usd_per_kg: (parseFloat(currentPrice) * 2.20462).toFixed(4),
      currency: 'USD',
      timestamp: new Date().toISOString(),
      change_percent: (variation / basePrice * 100).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching coffee price:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { cooperative_id } = req.user;
    
    // Total farmers
    const farmersResult = await pool.query(
      'SELECT COUNT(*) as count FROM farmers WHERE cooperative_id = $1',
      [cooperative_id]
    );
    
    // Total batches
    const batchesResult = await pool.query(
      'SELECT COUNT(*) as count FROM harvest_batches WHERE cooperative_id = $1',
      [cooperative_id]
    );
    
    // Total quantity (kg)
    const quantityResult = await pool.query(
      'SELECT SUM(quantity_kg) as total FROM harvest_batches WHERE cooperative_id = $1',
      [cooperative_id]
    );
    
    // Recent batches (last 30 days)
    const recentResult = await pool.query(
      `SELECT COUNT(*) as count FROM harvest_batches 
       WHERE cooperative_id = $1 AND harvest_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [cooperative_id]
    );
    
    res.json({
      total_farmers: parseInt(farmersResult.rows[0].count),
      total_batches: parseInt(batchesResult.rows[0].count),
      total_quantity_kg: parseFloat(quantityResult.rows[0].total || 0),
      recent_batches_30d: parseInt(recentResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Coffee Supply Chain API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
