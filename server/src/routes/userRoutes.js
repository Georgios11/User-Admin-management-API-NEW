const userRouter = require("express").Router();
const formidable = require("express-formidable");
const session = require("express-session");

const {
  registerUser,
  verifyEmail,
  login,
  logout,
  userProfile,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword,
} = require("../controllers/usersControllers");
const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");

userRouter.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 60000 },
  })
);

userRouter.post("/register", formidable(), registerUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/login", isLoggedOut, login);
userRouter.get("/logout", isLoggedIn, logout);
userRouter
  .route("/")
  .get(isLoggedIn, userProfile)
  .delete(isLoggedIn, deleteUser)
  .put(isLoggedIn, formidable(), updateUser);
userRouter.post("/forget-password", isLoggedOut, forgetPassword);
userRouter.post("/reset-password", isLoggedOut, resetPassword);

module.exports = userRouter;
