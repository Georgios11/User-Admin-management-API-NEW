const formidable = require("express-formidable");
const session = require("express-session");

const adminRouter = require("express").Router();

const dev = require("../config");
const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");
const {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
} = require("../controllers/adminControllers");

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
adminRouter.get("/dashboard", isLoggedIn, getAllUsers);
//adminRouter.post("/dashboard", isLoggedIn, createUser);
//adminRouter.put("/dashboard", isLoggedIn, updateUser);
//adminRouter.delete("/dashboard", isLoggedIn, deleteUser);

module.exports = adminRouter;
