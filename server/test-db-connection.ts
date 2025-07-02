import { Pool } from '@neondatabase/serverless';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found');
      return;
    }
    
    console.log('DATABASE_URL exists:', process.env.DATABASE_URL.substring(0, 30) + '...');
    
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5
    });
    
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Query result:', result.rows[0]);
    
    client.release();
    await pool.end();
    
    console.log('Database connection test completed successfully');
  } catch (error) {
    console.error('Database connection test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      severity: error.severity,
      detail: error.detail
    });
  }
}

testConnection();