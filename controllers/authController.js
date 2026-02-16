const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
    try {
        const { name, firstName: reqFirstName, lastName: reqLastName, email, password, role } = req.body;

        // Check if user exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        // Determine role - default to 'member' if not specified or invalid
        const userRole = role === 'admin' || role === 'trainer' ? role : 'member';

        // Handle name logic
        let firstName, lastName, fullName;

        if (reqFirstName && reqLastName) {
            // New frontend sends separated names
            firstName = reqFirstName;
            lastName = reqLastName;
            fullName = `${firstName} ${lastName}`;
        } else {
            // Legacy/Fallback
            const nameParts = (name || '').split(' ');
            firstName = nameParts[0] || 'User';
            lastName = nameParts.slice(1).join(' ') || 'Member';
            fullName = name || `${firstName} ${lastName}`;
        }

        const [result] = await db.execute(
            'INSERT INTO users (name, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [fullName, firstName, lastName, email, hashedPassword, userRole]
        );

        const [newUser] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
        const user = newUser[0];

        // Emit event to admin dashboard
        if (req.io) {
            req.io.emit('newMember', user);
        }

        if (userRole === 'member') {
            return res.status(201).json({
                success: true,
                message: 'Registration successful. Account pending approval.'
            });
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = rows[0];

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check status
        if (user.status === 'pending') {
            return res.status(403).json({ success: false, error: 'Your account is pending approval by an administrator.' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ success: false, error: 'Your account has been rejected. Please contact support.' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
    try {
        const user = req.user;
        // Remove password from response
        delete user.password;

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Remove password from response
    delete user.password;

    res
        .status(statusCode)
        .cookie('token', token, options) // Optional: usage of cookies
        .json({
            success: true,
            token,
            user
        });
};
