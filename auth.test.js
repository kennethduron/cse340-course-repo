import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import db from './src/models/db.js';
import { createUser, authenticateUser } from './src/models/users.js';
import { requireRole } from './src/controllers/users.js';

test('auth registration and login flow stores hashes and strips password data', async () => {
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 100000)}@example.com`;
    const password = 'Password123';
    const name = 'Test User';
    let userId;

    try {
        userId = await createUser(name, uniqueEmail, await bcrypt.hash(password, 10));
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
        assert.equal(loggedInUser.role_name, 'user');
        assert.equal(loggedInUser.password, undefined);
        assert.equal(loggedInUser.password_hash, undefined);

        const failedLogin = await authenticateUser(uniqueEmail, 'WrongPassword123');
        assert.equal(failedLogin, null, 'authenticateUser should reject the wrong password');
    } finally {
        if (userId) {
            await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
        }
    }
});

test('requireRole redirects unauthenticated and non-admin users and allows admins', () => {
    const runGuard = (user) => {
        const response = {
            messages: [],
            redirectTarget: null,
            redirect(target) {
                this.redirectTarget = target;
                return this;
            }
        };
        const request = {
            flash(type, message) {
                response.messages.push({ type, message });
            }
        };
        if (user) {
            request.session = { user };
        }

        let nextCalled = false;
        requireRole('admin')(request, response, () => {
            nextCalled = true;
        });

        return { response, nextCalled };
    };

    const loggedOut = runGuard(null);
    assert.equal(loggedOut.response.redirectTarget, '/login');
    assert.equal(loggedOut.response.messages[0].message, 'You must be logged in to access this page.');

    const regularUser = runGuard({ role_name: 'user' });
    assert.equal(regularUser.response.redirectTarget, '/');
    assert.equal(regularUser.response.messages[0].message, 'You do not have permission to access this page.');

    const adminUser = runGuard({ role_name: 'admin' });
    assert.equal(adminUser.nextCalled, true);
});
