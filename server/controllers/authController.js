const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        department
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const fs = require('fs');
    const path = require('path');

    const user = await User.findOne({ email });
    const isMatch = user ? await user.matchPassword(password) : false;

    const logMsg = `[${new Date().toISOString()}] Login Attempt: ${email} | Found: ${!!user} | Match: ${isMatch}\n`;
    fs.appendFileSync(path.join(__dirname, '../auth_debug.log'), logMsg);

    if (user && isMatch) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get All Users (for assigning staff)
// @route   GET /api/auth/users
// @access  Admin/Staff
const getUsers = async (req, res) => {
    // Optionally filter by role if query param exists
    const users = await User.find(req.query.role ? { role: req.query.role } : {}).select('-password');
    res.json(users);
};

module.exports = { registerUser, loginUser, getUsers };
