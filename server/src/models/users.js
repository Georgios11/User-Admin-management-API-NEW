const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "User name is required"],
    minlength: [3, "Minimum name length is 3 characters"],
    maxlength: [40, "Maximum name length is 40 characters"],
  },
  email: {
    type: String,
    required: [true, "User email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    min: [6, "Minimum password length is 6 chars"],
  },
  phone: {
    type: String,
    required: [true, "User phone is required"],
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
});
const User = model("users", userSchema);
module.exports = User;
