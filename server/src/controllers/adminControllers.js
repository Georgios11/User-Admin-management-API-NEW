const fs = require("fs");
const jwt = require("jsonwebtoken");
const excelJS = require("exceljs");

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
        ok: false,
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
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.findById(id);
    if (!users) {
      return res.status(404).json({
        message: "user was not found with this id",
      });
    }
    await User.findByIdAndDelete(id);
    //successResponse(res, 200, "User was deleted by admin");
    return res.status(200).json({
      message: "User deleted by admin",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const exportUsers = async (req, res) => {
  try {
    const workBook = new excelJS.Workbook();
    const workSheet = workBook.addWorksheet("Users");
    workSheet.columns = [
      { headers: "Name", key: "name" },
      { headers: "Email", key: "email" },
      //   { headers: "Password", key: "password" },
      { headers: "Image", key: "image" },
      { headers: "Phone", key: "phone" },
      { headers: "Is Admin", key: "is_admin" },
      { headers: "Is Banned", key: "is_banned" },
    ];
    const userData = await User.find({ is_admin: 0 });
    userData.map((user) => {
      workSheet.addRow(user);
    });
    workSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreatsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "users.xlsx"
    );
    return Workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    return error;
  }
};
module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUserByAdmin,
  exportUsers,
};
