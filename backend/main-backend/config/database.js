import { Pool } from 'pg';

console.log('=== Database Config Debug ===');
console.log('DATABASE_URL value:', process.env.DATABASE_URL);

let pool = null;

function getPool() {
    if (!pool) {
        console.log('Creating database pool with:', process.env.DATABASE_URL);
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('connect', () => {
            console.log('Main Backend: PostgreSQL connected');
        });

        pool.on('error', (err) => {
            console.error('Main Backend: PostgreSQL error', err);
        });
    }
    return pool;
}

export default getPool;