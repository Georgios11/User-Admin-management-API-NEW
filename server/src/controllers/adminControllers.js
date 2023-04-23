const fs = require("fs");
const jwt = require("jsonwebtoken");

const {
  securePassword,
  comparePassword,
} = require("../helpers/securePassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email or password is missing",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No user found with this email",
      });
    }
    //check if is admin
    if (!user.is_admin) {
      return res.status(400).json({
        message: "You are not an admin",
      });
    }
    //make sure the user is not an admin
    const matchPassword = await comparePassword(password, user.password);

    if (!matchPassword) {
      return res.status(400).json({
        message: "Email or password mismatch",
      });
    }
    //creating the session->goes to the browser
    //as a cookie

    req.session.userId = user._id;

    //////////////////
    res.status(200).json({
      message: "Admin Login succesfull",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const logoutAdmin = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");
    res.status(200).json({
      ok: true,
      message: "Admin Logout succesfull",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 });
    res.status(200).json({
      ok: true,
      message: "Returned all users",
      users,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

//admin profile
//reset password
//forget password

//DASHBOARD - CRUD -> CREATE USER -READ USER -UPDATE USER-DELETE USER
module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
};
