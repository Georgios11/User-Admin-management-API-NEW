const formidable = require("express-formidable");
const session = require("express-session");

const adminRouter = require("express").Router();

const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");
const {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUserByAdmin,
  exportUsers,
} = require("../controllers/adminControllers");
const { registerUser } = require("../controllers/usersControllers");
const isAdmin = require("../middlewares/isAdmin");

adminRouter.use(
  session({
    name: "admin_session",
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 60000 },
  })
);
adminRouter.post("/login", isLoggedOut, loginAdmin);
adminRouter.get("/logout", isLoggedIn, logoutAdmin);
adminRouter.post("/register", formidable(), registerUser);
adminRouter.get("/dashboard", isLoggedIn, getAllUsers);
//adminRouter.post("/dashboard", isLoggedIn, createUser);
//adminRouter.put("/dashboard", isLoggedIn, updateUser);
adminRouter.delete("/dashboard/:id", deleteUserByAdmin);
//adminRouter.get("/dashboard/export-excel-data", exportUsers);
module.exports = adminRouter;
