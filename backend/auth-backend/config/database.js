/**
 * PostgreSQL connection pool configuration.
 *
 * This module creates and exports a connection pool using the `pg` library.
 * The pool manages multiple database client connections for efficient querying.
 */

const { Pool } = require('pg');

/**
 * Connection pool instance for PostgreSQL.
 *
 * @type {Pool}
 * @property {string} connectionString - Database connection string, stored in `process.env.DATABASE_URL`.
 * @property {boolean|object} ssl - SSL configuration: enabled with relaxed certificate validation in production, disabled otherwise.
 * @property {number} max - Maximum number of clients allowed in the pool.
 * @property {number} idleTimeoutMillis - Time (in ms) before an idle client is closed (default: 30s).
 * @property {number} connectionTimeoutMillis - Time (in ms) to wait before timing out when connecting a new client (default: 2s).
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Event listener: Fires when the pool establishes a new client connection.
 * Logs a success message.
 */
pool.on('connect', () => {
    console.log('Auth Backend: PostgreSQL connected');
});

/**
 * Event listener: Fires when the pool encounters an unexpected error.
 * Logs the error to the console.
 *
 * @param {Error} err - The error object thrown by PostgreSQL.
 */
pool.on('error', (err) => {
    console.error('Auth Backend: PostgreSQL error', err);
});

/**
 * Exports the PostgreSQL connection pool.
 *
 * @module dbPool
 * @type {Pool}
 */
module.exports = pool;
