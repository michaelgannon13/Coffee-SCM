const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  console.log('🌱 Seeding database with demo data...');
  
  try {
    // Create cooperatives
    const coopResult = await pool.query(`
      INSERT INTO cooperatives (name, location, country, contact_email, contact_phone)
      VALUES 
        ('Honduras Coffee Growers Cooperative', 'Santa Barbara', 'Honduras', 'info@hondurascoop.org', '+504-9999-1234'),
        ('Kenya Highlands Cooperative', 'Nyeri', 'Kenya', 'contact@kenyahighlands.co.ke', '+254-700-123456')
      RETURNING id
    `);
    
    const coopIds = coopResult.rows.map(r => r.id);
    console.log(`✅ Created ${coopIds.length} cooperatives`);
    
    // Create admin users
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, role, cooperative_id)
      VALUES 
        ('admin@hondurascoop.org', $1, 'admin', $2),
        ('admin@kenyahighlands.co.ke', $1, 'admin', $3)
    `, [passwordHash, coopIds[0], coopIds[1]]);
    
    console.log('✅ Created admin users');
    console.log('   📧 admin@hondurascoop.org / demo123');
    console.log('   📧 admin@kenyahighlands.co.ke / demo123');
    
    // Create farmers
    const farmerResult = await pool.query(`
      INSERT INTO farmers (cooperative_id, farmer_code, first_name, last_name, phone, farm_location, farm_size_hectares, certification)
      VALUES 
        ($1, 'HN-001', 'Carlos', 'Martinez', '+504-9999-5001', 'Santa Barbara, Honduras', 2.5, 'Fairtrade'),
        ($1, 'HN-002', 'Maria', 'Lopez', '+504-9999-5002', 'Copán, Honduras', 3.2, 'Organic'),
        ($1, 'HN-003', 'Juan', 'Rodriguez', '+504-9999-5003', 'Intibucá, Honduras', 1.8, 'Fairtrade'),
        ($2, 'KE-001', 'James', 'Kimani', '+254-700-456789', 'Nyeri, Kenya', 4.0, 'Organic'),
        ($2, 'KE-002', 'Grace', 'Wanjiru', '+254-700-456790', 'Kirinyaga, Kenya', 2.7, 'Fairtrade')
      RETURNING id, cooperative_id
    `, [coopIds[0], coopIds[1]]);
    
    console.log(`✅ Created ${farmerResult.rows.length} farmers`);
    
    // Create harvest batches
    const batches = [];
    const varieties = ['Arabica Typica', 'Arabica Bourbon', 'Arabica Caturra', 'SL28', 'SL34'];
    const grades = ['A', 'AA', 'AAA'];
    const processing = ['Washed', 'Natural', 'Honey'];
    
    for (const farmer of farmerResult.rows) {
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));
        
        batches.push([
          `BATCH-${farmer.cooperative_id === coopIds[0] ? 'HN' : 'KE'}-${farmer.id}-${Date.now()}-${i}`,
          farmer.id,
          farmer.cooperative_id,
          date.toISOString().split('T')[0],
          (Math.random() * 500 + 50).toFixed(2),
          grades[Math.floor(Math.random() * grades.length)],
          varieties[Math.floor(Math.random() * varieties.length)],
          processing[Math.floor(Math.random() * processing.length)],
          'Good quality harvest, optimal weather conditions'
        ]);
      }
    }
    
    for (const batch of batches) {
      await pool.query(`
        INSERT INTO harvest_batches (batch_code, farmer_id, cooperative_id, harvest_date, quantity_kg, quality_grade, variety, processing_method, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, batch);
    }
    
    console.log(`✅ Created ${batches.length} harvest batches`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${coopIds.length} cooperatives`);
    console.log(`   - ${farmerResult.rows.length} farmers`);
    console.log(`   - ${batches.length} harvest batches`);
    console.log(`   - 2 admin accounts (password: demo123)`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
