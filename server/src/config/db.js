const mongoose = require("mongoose");
const dev = require(".");

const connectDB = async () => {
  try {
    await mongoose.connect(dev.db.url);
    console.log("MONGO CONNECTED");
  } catch (error) {
    console.log("MONGO IS FUCKED");
    console.log(error);
  }
};
module.exports = connectDB;
