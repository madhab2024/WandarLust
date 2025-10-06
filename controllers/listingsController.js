const Listing = require('../models/listings');
const WrapAsync = require('../utils/WrapAsync');
const mongoose = require('mongoose');

// Show all listings
module.exports.index = WrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render('listings/listing.ejs', { allListing: listings });
});

// Show new listing form
module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

// Show a single listing
module.exports.showListing = WrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid Listing ID');
    return res.redirect('/listings');
  }

  const listing = await Listing.findById(id)
    .populate({ path: 'reviews', populate: { path: 'author' } })
    .populate('owner');

  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  res.render('listings/show.ejs', { listing });
});

// Create a new listing
module.exports.createListing = WrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash('success', 'Listing created successfully!');
  res.redirect(`/listings/${newListing._id}`);
});

// Render edit form
module.exports.renderEditForm = WrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid Listing ID');
    return res.redirect('/listings');
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  res.render('listings/edit.ejs', { listing });
});

// Update a listing
module.exports.updateListing = WrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid Listing ID');
    return res.redirect('/listings');
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${id}`);
});

// Delete a listing
module.exports.deleteListing = WrapAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid Listing ID');
    return res.redirect('/listings');
  }

  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }

  req.flash('success', 'Listing deleted successfully!');
  res.redirect('/listings');
});
