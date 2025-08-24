const mongoose = require("mongoose");
const csv = require("csvtojson");
const Listing = require("./listing"); // your model path

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/AirBnb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

async function importCSV() {
  try {
    // Load CSV file
    const jsonArray = await csv().fromFile("Listings.csv");

    // Map CSV rows to Listing schema
    const docs = jsonArray.map(row => ({
      title: row.Title,
      description: row.Description,
      image: {
        filename: row.ImageFilename || "",
        url: row.ImageURL || "",
      },
      price: Number(row.Price),
      location: row.Location,
      country: row.Country,
      email: row.Email,
      reviews: [] // no reviews at insert
    }));

    // Insert into MongoDB
    await Listing.insertMany(docs);
    console.log("🎉 CSV data inserted successfully!");

  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    mongoose.connection.close();
  }
}

importCSV();
