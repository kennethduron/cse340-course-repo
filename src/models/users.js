import bcrypt from 'bcrypt';
import db from './db.js';

const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
        RETURNING user_id;
    `;

    const result = await db.query(query, [name, email, passwordHash]);
    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users AS u
        JOIN roles AS r ON u.role_id = r.role_id
        WHERE u.email = $1;
    `;

    const result = await db.query(query, [email]);
    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
        return null;
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
};

export { createUser, authenticateUser };
