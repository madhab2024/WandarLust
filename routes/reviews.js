const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAuthor } = require('../middleware.js');
const reviews = require('../controllers/reviewsController');

// Add review
router.post('/', isLoggedIn, reviews.createReview);

// Delete review
router.delete('/:reviewId', isLoggedIn, isAuthor, reviews.deleteReview);

module.exports = router;
