const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, admin, getUsers);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    const token = generateToken(req.user._id);
    const userData = JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        token: token
    });
    // Redirect to frontend with user data in query params (standard for simplicity in mobile/spa demos)
    // Or use a script to set localStorage. We'll send it as a script for the SPA.
    res.send(`
        <script>
            localStorage.setItem('user', '${userData}');
            window.location.href = 'http://localhost:5173/';
        </script>
    `);
});

module.exports = router;
