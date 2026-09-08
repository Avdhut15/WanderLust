require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const geocodeLocation = require("../utils/geocode.js");

const MONGO_URL = process.env.ATLAS_DB_URL || process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("ATLAS_DB_URL or MONGO_URL must be configured before seeding.");
}

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  const listings = [];

  for (const listing of initData.data) {
    const geometry = await geocodeLocation(listing.location, listing.country);
    listings.push({ ...listing, geometry, owner: "6a8ae7c4bd82f78e95fe8960" });
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  await Listing.deleteMany({});
  await Listing.insertMany(listings);
  console.log("data was initialized");
};

async function run() {
  try {
    await main();
    console.log("connected to DB");
    await initDB();
    await mongoose.connection.close();
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
    await mongoose.connection.close();
    process.exitCode = 1;
  }
}

run();
