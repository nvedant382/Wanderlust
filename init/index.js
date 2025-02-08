require("dotenv").config({ path: __dirname + "/../.env" }); // Ensure correct path

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLASDB_URL

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=> ({...obj,owner:"6797e97b65b90ac850e5428e"}))
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();