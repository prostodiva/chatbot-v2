const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Represents a User and provides methods to interact with the database.
 */
class User {
    /**
     * Creates a new user in the database.
     * @param {Object} user - The user data.
     * @param {string} user.name - The user's name.
     * @param {string} user.email - The user's email.
     * @param {string} user.password - The user's plaintext password (will be hashed).
     * @returns {Promise<Object>} The newly created user (id, name, email, created_at).
     */
    static async create({ name, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, created_at)
            VALUES ($1, $2, $3, NOW())
                RETURNING id, name, email, created_at
        `;

        const result = await pool.query(query, [name, email, hashedPassword]);
        return result.rows[0];
    }

    /**
     * Finds a user by email.
     * @param {string} email - The email of the user to find.
     * @returns {Promise<Object|null>} The user object or null if not found.
     */
    static async findByEmail(email) {
        const query = `
            SELECT id, name, email, password, created_at
            FROM users
            WHERE email = $1
        `;

        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    /**
     * Finds a user by ID.
     * @param {number} id - The ID of the user to find.
     * @returns {Promise<Object|null>} The user object or null if not found.
     */
    static async findById(id) {
        const query = `
            SELECT id, name, email, password, created_at
            FROM users
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Compares a plaintext password with a hashed password.
     * @param {string} password - The plaintext password.
     * @param {string} hashedPassword - The hashed password from the database.
     * @returns {Promise<boolean>} True if the password matches, false otherwise.
     */
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    /**
     * Retrieves all users from the database.
     * @returns {Promise<Array<Object>>} Array of user objects.
     */
    static async findAll() {
        const query = `
            SELECT id, name, email, password, created_at
            FROM users
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }
}

module.exports = User;

