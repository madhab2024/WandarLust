const Joi = require("joi");
const ExpressError = require("../utils/ExpressError"); 

// Validation schema
const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().allow(""), // optional
    image: Joi.object({
      filename: Joi.string().allow(""), // optional
      url: Joi.string().uri().allow(""), // optional
    }),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    email: Joi.string().email().required(),
  }).required(),
});

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
