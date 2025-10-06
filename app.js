const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');
const userRouter = require('./routes/user');
const express = require('express');
const session = require('express-session');
const app = express();
const port= process.env.PORT || 3000;
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const engine = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const User = require('./models/user');
require('dotenv').config();

// MongoDB connection
async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}
main().then(() => {
    console.log("Connection Successful");
}).catch(() => {
    console.log("Connection Error");
});

// Middleware setup
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret : "i am gay",
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() +  7 * 24 * 60 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware to expose messages to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

app.get('/demouser', async(req,res)=>{
    let fackuser = new User({
        email: "madhab1@gmail.com",
        username: "madhab1"
    })
    let registerdUser = User.register(fackuser, "Madhab2005")
    res.send(registerdUser);
    console.log(registerdUser)
})

// Routes
// app.get("/", (req, res) => {
//     res.render('./listings/start.ejs');
// });

// INDEX Route

app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);
app.use('/', userRouter);

// Catch-all for unknown routes
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});


// Error handler
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).render("error.ejs", { err });
});


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/listings`);
});
