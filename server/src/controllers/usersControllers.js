const fs = require("fs");
const jwt = require("jsonwebtoken");

const {
  securePassword,
  comparePassword,
} = require("../helpers/securePassword");
const User = require("../models/users");
const dev = require("../config");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const { successResponse } = require("../helpers/responseHandler");

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.fields;
    const { image } = req.files;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Please enter all fields",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Minimum password length is 6 characters",
      });
    }
    if (image && image.size > 1000000) {
      return res.status(400).json({
        message: "Maximum image size is 1MB",
      });
    }
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(400).json({
        message: "This email account is already registered",
      });
    }
    const hashedPassword = await securePassword(password);
    const token = jwt.sign(
      { name, email, phone, hashedPassword, image },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );
    //prepare the email
    const emailData = {
      email,
      subject: "Account activation",
      html: `
      <h2> Hello dear ${name}</h2>
      <p> Click on the link to <a href="${dev.app.clientUrl}/api/users/activate?token=${token}"> activate your account</a></p>
      `,
    };
    sendEmailWithNodeMailer(emailData);
    successResponse(
      res,
      200,
      `A verification email has been sent to your email`,
      token
    );
    // res.status(200).json({
    //   message: `A verification email has been sent to ${email}`,
    //   token,
    // });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const verifyEmail = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(500).json({
        message: "Token is missing",
      });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          message: "Token is expired",
        });
      }
      const { name, email, hashedPassword, phone, image } = decoded;

      const userExists = await User.findOne({ email: email });
      if (userExists) {
        return res.status(500).json({
          message: "This email account is already registered",
        });
      }
      const password = hashedPassword;
      const newUser = new User({
        name,
        email,
        phone,
        password,
      });

      if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
      }
      const user = await newUser.save();

      if (!user) {
        return res.status(400).json({
          message: "User was not created",
        });
      }

      res.status(201).json({
        message: "User created redy to sign in",
        user,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const login = async (req, res) => {
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
        message: "No user found with this email, please register first",
      });
    }
    if (user.isBanned) {
      return res.status(401).json({
        message: "User is banned",
      });
    }
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
      message: "Login succesfull",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const logout = (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");
    res.status(200).json({
      ok: true,
      message: "Logout succesfull",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};
const userProfile = async (req, res) => {
  try {
    const userData = await User.findById(req.session.userId, { password: 0 });
    res.status(200).json({
      message: "User profile returned",
      userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    res.status(200).json({
      message: "User profile deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    //if we have the password we have to hash
    if (!req.fields.password) {
      //give a response
    }
    const hashedPassword = await securePassword(req.fields.password);
    const updatedData = await User.findByIdAndUpdate(
      req.session.userId,
      {
        ...req.fields,
        password: hashedPassword,

        // name:req.fields.name,
        // phone:req.fields.phone,
      },
      { new: true }
    );
    if (!updatedData) {
      res.status(200).json({
        ok: false,
        message: "Profile not updated",
      });
    }
    if (req.files.image) {
      const { image } = req.files;
      updatedData = fs.readFileSync(image.path);
      updatedData.image.contentType = image.type;
    }
    await updatedData.save();
    res.status(200).json({
      message: "User profile updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const forgetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email or password is missing",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Minimum password length is 6 characters",
      });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User not found ",
      });
    }
    const hashedPassword = await securePassword(password);
    const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, {
      expiresIn: "10m",
    });
    //prepare the email
    const emailData = {
      email,
      subject: "Reset Password",
      html: `
      <h2> Hello dear ${user.name}</h2>
      <p> Click on the link to <a href="${dev.app.clientUrl}/api/users/reset-password?token=${token}"> reset your password </a></p>
      `,
    };
    sendEmailWithNodeMailer(emailData);

    res.status(200).json({
      message: `A verification email has been sent to ${email}`,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const resetPassword = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(500).json({
        message: "Token is missing",
      });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(500).json({
          message: "Token is expired",
        });
      }
      const { email, hashedPassword } = decoded;

      const userExists = await User.findOne({ email: email });
      if (!userExists) {
        return res.status(500).json({
          message: "This email account does not exist",
        });
      }
      //update the user
      const updatedUser = User.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );
      if (!updateUser) {
        res.status(400).json({
          message: "Password not updated",
        });
      }
      res.status(201).json({
        message: "Password reset done",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  login,
  logout,
  userProfile,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword,
};
