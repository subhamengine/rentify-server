const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

const pool = new Pool({
  connectionString
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL cluster successfully!');

    const createTableRentifyProperties = `
      CREATE TABLE IF NOT EXISTS "rentifyPropertiesFinal" (
        id SERIAL PRIMARY KEY,
        propertyName VARCHAR(100) NOT NULL,
        place VARCHAR(50) NOT NULL,
        area VARCHAR(100) NOT NULL,
        numberOfBedrooms VARCHAR(10) NOT NULL,
        details VARCHAR(200) NOT NULL,
        seller_id VARCHAR(30) NOT NULL,
        seller_name VARCHAR(30) NOT NULL,
        picturePath varchar(1000) NOT NULL,
        likedby TEXT[],
        likes VARCHAR(500)
      );
    `;

    const createTableRentifyUsers = `
      CREATE TABLE IF NOT EXISTS "rentifyUsers" (
        id SERIAL PRIMARY KEY,
        propertyName VARCHAR(50) NOT NULL,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mob VARCHAR(10) NOT NULL,
        type VARCHAR(10) NOT NULL,
        password VARCHAR(30) NOT NULL
      );
    `;

    // Execute the SQL queries
    await client.query(createTableRentifyProperties);
    await client.query(createTableRentifyUsers);

    // Release the client back to the pool
    client.release();
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    // Close the pool
    
  }
})();

module.exports = pool;
