const express = require('express');
const router = express.Router();
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const auth = require('../controllers/authController');

// SIGNUP
router.get('/signup', auth.renderSignup);
router.post('/signup', auth.signup);

// LOGIN
router.get('/login', auth.renderLogin);
router.post(
    '/login',
    saveRedirectUrl,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    auth.login
);

// LOGOUT
router.get('/logout', auth.logout);

module.exports = router;
