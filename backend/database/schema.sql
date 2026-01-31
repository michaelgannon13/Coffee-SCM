-- Coffee Supply Chain Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS harvest_batches CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS cooperatives CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Cooperatives Table
CREATE TABLE cooperatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (for authentication - admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, farmer
    cooperative_id INTEGER REFERENCES cooperatives(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farmers Table
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    cooperative_id INTEGER REFERENCES cooperatives(id),
    farmer_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    farm_location VARCHAR(255),
    farm_size_hectares DECIMAL(10, 2),
    certification VARCHAR(100), -- e.g., Fairtrade, Organic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Harvest Batches Table
CREATE TABLE harvest_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(100) UNIQUE NOT NULL,
    farmer_id INTEGER REFERENCES farmers(id),
    cooperative_id INTEGER REFERENCES cooperatives(id),
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    quality_grade VARCHAR(50), -- e.g., A, AA, AAA
    variety VARCHAR(100), -- e.g., Arabica, Robusta
    processing_method VARCHAR(100), -- e.g., Washed, Natural, Honey
    notes TEXT,
    qr_code_url TEXT,
    status VARCHAR(50) DEFAULT 'logged', -- logged, verified, shipped
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_farmers_coop ON farmers(cooperative_id);
CREATE INDEX idx_batches_farmer ON harvest_batches(farmer_id);
CREATE INDEX idx_batches_coop ON harvest_batches(cooperative_id);
CREATE INDEX idx_batches_date ON harvest_batches(harvest_date);
