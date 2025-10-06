const Listing = require('../models/listings');
const Review = require('../models/review');
const WrapAsync = require('../utils/WrapAsync');

// Add a review
module.exports.createReview = WrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  await newReview.save();

  listing.reviews.push(newReview._id);
  await listing.save();

  req.flash('success', 'Review added successfully!');
  res.redirect(`/listings/${listing._id}`);
});

// Delete a review
module.exports.deleteReview = WrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash('success', 'Review deleted successfully!');
  res.redirect(`/listings/${id}`);
});
