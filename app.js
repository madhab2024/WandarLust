const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing');
const methodOverride = require('method-override');
const WrapAsync = require('./utils/WrapAsync');
const ExpressError = require('./utils/ExpressError');
const engine = require('ejs-mate');
const Review = require('./models/review');
require('dotenv').config();


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
// Paginated INDEX Route
// INDEX (paginated)
app.get('/listings', WrapAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;                       // 3 cards x 3 rows
  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    Listing.find({}).skip(skip).limit(limit),
    Listing.countDocuments()
  ]);

  const hasMore = page * limit < total;

  // AJAX → return JSON for infinite scroll
  const isAjax = req.xhr || (req.headers['x-requested-with'] === 'XMLHttpRequest') ||
                 (req.headers.accept && req.headers.accept.includes('application/json'));
  if (isAjax) return res.json({ listings, hasMore });

  // First load → SSR with EJS
  res.render("./listings/listing.ejs", {
    allListing: listings,   // keep your variable name
    page,
    hasMore
  });
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

//adding review Model

app.post('/listings/:id/reviews', WrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review saved");
    res.redirect(`/listings/${listing._id}`); // redirect instead of plain send
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
