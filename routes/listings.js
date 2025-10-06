const express = require('express');
const router = express.Router();
const { isLoggedIn, isOwner } = require('../middleware.js'); 
const { validateListing } = require('../models/validateListing');
const listings = require('../controllers/listingsController');

// INDEX
router.get('/', listings.index);

// NEW
router.get('/new', isLoggedIn, listings.renderNewForm);

// Routes for specific listing ID
router.route('/:id')
  .get(listings.showListing) // SHOW
  .put(isLoggedIn, isOwner, validateListing, listings.updateListing) // UPDATE
  .delete(isLoggedIn, isOwner, listings.deleteListing); // DELETE

// CREATE
router.post('/', isLoggedIn, validateListing, listings.createListing);

// EDIT form
router.get('/:id/edit', isLoggedIn, isOwner, listings.renderEditForm);

module.exports = router;
