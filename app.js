const express = require('express');
const app = express();
const port= process.env.PORT || 3000;
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listings');
const methodOverride = require('method-override');
const WrapAsync = require('./utils/WrapAsync');
const ExpressError = require('./utils/ExpressError');
const engine = require('ejs-mate');
const Review = require('./models/review');
const review = require('./models/review');
require('dotenv').config();

// MongoDB connection
async function main() {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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
  const listings = await Listing.find({}).populate("reviews");
  res.render("listings/listing.ejs", { allListing: listings });
}));

// NEW form Route
app.get('/listings/new', (req, res) => {
    res.render('./listings/new.ejs');
});

// SHOW Route
app.get('/listings/:id', WrapAsync(async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("error.ejs", { err });
    }
    const listing = await Listing.findById(id).populate("reviews"); // populate reviews
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("./listings/show.ejs", { listing }); // lowercase key
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

// Add review
app.post('/listings/:id/reviews', WrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");

    const newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview._id); // push only the ObjectId
    await listing.save();

    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`);
}));

// Adding Delete Button in reviews card
app.delete('/listings/:id/reviews/:reviewId', WrapAsync(async(req, res)=>{
    let {id, reviewId} = req.params;
    await Review.findByIdAndUpdate(id, {reviews: reviewId});
    await Review.findByIdAndDelete(reviewId);
    console.log("Review Deleted ", reviewId);
    res.redirect(`/listings/${id}`)
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
