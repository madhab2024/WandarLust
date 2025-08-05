const express = require('express');
const app = express();
const port = 5050;
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing');
const methodOverride = require('method-override');
const WrapAsync = require('./utils/WrapAsync');
const ExpressError = require('./utils/ExpressError');
const engine = require('ejs-mate');

const MONGO_URL = "mongodb://127.0.0.1:27017/AirBnb";

// MongoDB connection
async function main() {
    await mongoose.connect(MONGO_URL);
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

// Routes
app.get("/", (req, res) => {
    res.render('./listings/start.ejs');
});

// INDEX Route
app.get('/listings', WrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("./listings/listing.ejs", { allListing });
}));

// NEW form Route
app.get('/listings/new', (req, res) => {
    res.render('./listings/new.ejs');
});

// SHOW Route
app.get('/listings/:id', WrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Listing ID");
    }
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
        return res.status(404).send("Listing not found");
    }
    res.render("./listings/show.ejs", { Listing: foundListing });
}));

// CREATE Route
app.post('/listings', WrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));

// EDIT form Route
app.get('/listings/:id/edit', WrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Listing ID");
    }
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
        return res.status(404).send("Listing not found");
    }
    res.render("./listings/edit.ejs", { listing: foundListing });
}));

// UPDATE Route
app.put('/listings/:id', WrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Listing ID");
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// DELETE Route
app.delete('/listings/:id', WrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid Listing ID");
    }
    const deletedItem = await Listing.findByIdAndDelete(id);
    if (!deletedItem) {
        return res.status(404).send("Listing not found");
    }
    console.log("Deleted:", deletedItem);
    res.redirect('/listings');
}));

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
