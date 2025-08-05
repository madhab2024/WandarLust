const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: { type: String, default: "" },  // Default value for filename
    url: { type: String, default: "" },       // Default value for URL
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  email: {
     type: String, 
     required: true 
    },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
