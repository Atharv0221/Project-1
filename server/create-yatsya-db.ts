import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function setupDatabase() {
    const connectionString = process.env.DATABASE_URL;
    // Extract base connection string (pointing to 'postgres' instead of 'yatsya_db')
    const baseConn = connectionString.includes('yatsya_db')
        ? connectionString.replace(/\/yatsya_db\?/, '/postgres?')
        : connectionString;

    const client = new Client({
        connectionString: baseConn,
    });

    try {
        await client.connect();
        console.log('Connected to default postgres database');

        // Check if yatsya_db exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='yatsya_db'");
        if (res.rowCount === 0) {
            console.log('Database yatsya_db does not exist. Creating...');
            await client.query('CREATE DATABASE yatsya_db');
            console.log('Database yatsya_db created successfully');
        } else {
            console.log('Database yatsya_db already exists');
        }
        await client.end();
    } catch (err) {
        console.error('Error setting up database:', err.message);
    }
}

setupDatabase();
