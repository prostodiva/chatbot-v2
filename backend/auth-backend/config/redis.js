const Redis = require('redis');

const redis = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379/0'
});

redis.on('error', (err) => console.error('Auth Backend: Redis Client Error', err));
redis.on('connect', () => console.log('Auth Backend: Redis connected'));

const connectRedis = async () => {
    try {
        await redis.connect();
    } catch (error) {
        console.error('Auth Backend: Redis connection error:', error);
    }
};

module.exports = { redis, connectRedis };