import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import db from './src/models/db.js';
import { addVolunteer, getVolunteeredProjects, isUserVolunteering, removeVolunteer } from './src/models/projects.js';
import { createUser, authenticateUser, getAllUsers } from './src/models/users.js';
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

    const usersPageRegularUser = (() => {
        const response = {
            redirectTarget: null,
            redirect(target) {
                this.redirectTarget = target;
                return this;
            }
        };
        const request = {
            session: { user: { role_name: 'user' } },
            flash() {}
        };
        requireRole('admin', '/dashboard')(request, response, () => {});
        return response;
    })();
    assert.equal(usersPageRegularUser.redirectTarget, '/dashboard');

    const adminUser = runGuard({ role_name: 'admin' });
    assert.equal(adminUser.nextCalled, true);
});

test('volunteering model adds, checks, lists, and removes project signups', async () => {
    const projectId = (await db.query('SELECT project_id FROM project ORDER BY project_id LIMIT 1')).rows[0].project_id;
    const uniqueEmail = `volunteer_${Date.now()}_${Math.floor(Math.random() * 100000)}@example.com`;
    const passwordHash = await bcrypt.hash('Password123', 10);
    const userId = await createUser('Volunteer Test User', uniqueEmail, passwordHash);

    try {
        await addVolunteer(userId, projectId);
        const isVolunteering = await isUserVolunteering(userId, projectId);
        assert.equal(isVolunteering, true);

        const volunteeredProjects = await getVolunteeredProjects(userId);
        assert.ok(volunteeredProjects.some((project) => Number(project.project_id) === Number(projectId)));

        await addVolunteer(userId, projectId);
        assert.equal(await isUserVolunteering(userId, projectId), true);

        const removedCount = await removeVolunteer(userId, projectId);
        assert.equal(removedCount, 1);
        assert.equal(await isUserVolunteering(userId, projectId), false);
        assert.ok(!(await getVolunteeredProjects(userId)).some((project) => Number(project.project_id) === Number(projectId)));
    } finally {
        await removeVolunteer(userId, projectId);
        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
    }
});

test('getAllUsers returns names, emails, and roles without credential fields', async () => {
    const users = await getAllUsers();

    assert.ok(users.length > 0);
    assert.deepEqual(Object.keys(users[0]).sort(), ['email', 'name', 'role_name', 'user_id']);
    assert.ok(users.every((user) => user.role_name === 'user' || user.role_name === 'admin'));
    assert.ok(users.every((user) => !('password' in user) && !('password_hash' in user)));
});
