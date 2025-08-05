const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Listing = require("./listing.js"); // Import your model

// Connect to MongoDB
const MONGO_URL = "mongodb://127.0.0.1:27017/AirBnb";
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Connection error:", err));

const exportDataToExcel = async () => {
  try {
    // Fetch all listings from the database
    const listings = await Listing.find({});

    // Convert MongoDB documents to a format Excel understands
    const data = listings.map((listing) => ({
      Title: listing.title,
      Description: listing.description,
      Image: listing.image?.url || listing.image, // Handle object vs string cases
      Price: listing.price,
      Location: listing.location,
      Country: listing.country,
      Email: listing.email,
    }));

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");

    // Write the workbook to a file
    XLSX.writeFile(workbook, "Listings.xlsx");
    
    console.log("✅ Data exported to Listings.xlsx successfully!");
    process.exit(); // Exit script
  } catch (error) {
    console.error("❌ Error exporting data:", error);
  }
};

// Run the export function
exportDataToExcel();
