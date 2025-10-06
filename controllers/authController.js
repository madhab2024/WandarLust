const User = require('../models/user');
const passport = require('passport');

// Render Signup Form
module.exports.renderSignup = (req, res) => {
    res.render('./Users/signup.ejs');
};

// Handle Signup
module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash('success', "Welcome to WanderLust 🎉🎉");
        res.redirect('/listings');
    } catch (err) {
        console.error(err);
        req.flash('error', "Something went wrong 😕😕");
        res.redirect('/signup');
    }
};

// Render Login Form
module.exports.renderLogin = (req, res) => {
    res.render('./Users/login.ejs');
};

// Handle Login
module.exports.login = (req, res) => {
    req.flash('success', "Welcome back 🎉🎉");
    if (res.locals.redirectUrl) {
        res.redirect(res.locals.redirectUrl);
    } else {
        res.redirect('/listings');
    }
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.flash('success', "You have logged out successfully 👋");
        res.redirect('/listings');
    });
};
