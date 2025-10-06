const Listing = require('./models/listings.js');
const Review = require('./models/review.js');

// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.redirectUrl = req.originalUrl;
  req.flash('error', '😕 Please login!');
  res.redirect('/login');
};

// Save redirect URL after login
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // optional cleanup
  }
  next();
};

// ✅ Check if current user is the listing owner
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
  if (!listing.owner.equals(req.user._id)) {
    req.flash('error', '⛔ You do not have permission to do that!');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// ✅ Check if current user is the review author
module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Review not found!');
    return res.redirect(`/listings/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash('error', '⛔ You are not authorized to modify this review!');
    return res.redirect(`/listings/${id}`);
  }
  next();
};
