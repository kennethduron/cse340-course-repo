import bcrypt from 'bcrypt';
import { createUser, authenticateUser } from '../models/users.js';

const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            req.flash('error', 'Name, email, and password are required.');
            return res.redirect('/register');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await createUser(name, email, passwordHash);
        req.flash('success', 'Registration successful. Please log in.');
        return res.redirect('/login');
    } catch (error) {
        if (error.code === '23505') {
            req.flash('error', 'An account with that email already exists.');
            return res.redirect('/register');
        }
        return next(error);
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', 'You have logged in successfully.');
        return res.redirect('/dashboard');
    } catch (error) {
        return next(error);
    }
};

const processLogout = (req, res) => {
    req.flash('success', 'You have logged out.');
    delete req.session.user;
    return res.redirect('/login');
};

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to view that page.');
        return res.redirect('/login');
    }

    return next();
};

const requireRole = (role) => (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }

    if (req.session.user.role_name !== role) {
        req.flash('error', 'You do not have permission to access this page.');
        return res.redirect('/');
    }

    return next();
};

const showDashboard = (req, res) => {
    const { name, email } = req.session.user;
    res.render('dashboard', { title: 'Dashboard', name, email });
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard
};
