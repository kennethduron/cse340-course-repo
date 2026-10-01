import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import db from './src/models/db.js';
import { createUser, authenticateUser } from './src/models/users.js';

test('auth registration and login flow stores hashes and strips password data', async () => {
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 100000)}@example.com`;
    const password = 'Password123';
    const name = 'Test User';

    const userId = await createUser(name, uniqueEmail, await bcrypt.hash(password, 10));
    assert.ok(typeof userId === 'number', 'createUser should return an integer user ID');

    const saved = await db.query(
        'SELECT name, email, password_hash, role_id FROM users WHERE user_id = $1',
        [userId]
    );

    assert.equal(saved.rows[0].email, uniqueEmail);
    assert.notEqual(saved.rows[0].password_hash, password);
    assert.ok(saved.rows[0].password_hash.startsWith('$2'));

    const loggedInUser = await authenticateUser(uniqueEmail, password);
    assert.ok(loggedInUser, 'authenticateUser should accept the correct password');
    assert.equal(loggedInUser.name, name);
    assert.equal(loggedInUser.email, uniqueEmail);
    assert.equal(loggedInUser.password_hash, undefined);

    const failedLogin = await authenticateUser(uniqueEmail, 'WrongPassword123');
    assert.equal(failedLogin, null, 'authenticateUser should reject the wrong password');

    await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
});
