/**
 * @file redis.js
 * @description This module creates a Redis client, sets up event listeners for connection
 *  and error handling, and exports both the Redis instance and a helper
 *  function to establish the connection.
 *
 * */

const Redis = require('redis');

/**
 * Redis client instance configured with a connection URL.
 * Falls back to localhost if REDIS_URL is not provided.
 *
 * @type {import('redis').RedisClientType}
 */
const redis = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379/0'
});

/**
 * Event listener for Redis client errors.
 * Logs an error message when the Redis client encounters issues.
 */
redis.on('error', (err) => console.error('Auth Backend: Redis Client Error', err));

/**
 * Event listener for successful Redis connection.
 * Logs a message when Redis is connected.
 */
redis.on('connect', () => console.log('Auth Backend: Redis connected'));

/**
 * Connects the Redis client to the server.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws {Error} Logs an error if the connection fails.
 */
const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (error) {
        console.error('Auth Backend: Redis connection error:', error);
    }
};


/**
 * Exports the Redis client and the connection helper.
 *
 * @module redisConfig
 * @property {import('redis').RedisClientType} redis - The Redis client instance.
 * @property {Function} connectRedis - Function to establish a Redis connection.
 */
module.exports = { redis, connectRedis };