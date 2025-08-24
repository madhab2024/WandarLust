const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review")

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
     required: true,
    },
  reviews: [
    {
        type: Schema.Types.ObjectId,
        ref: "Review"
    }
]

});

//Middelware to delete review of listing
listingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
    console.log(`Deleted reviews for listing ${doc._id}`);
  }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
