const User = require("../models/users");

const isAdmin = async (req, res, next) => {
  try {
    //req.sessio.userId->get the data of the person
    //who is logged in
    if (req.session.userId) {
      const id = req.session.userId;
      const adminData = await User.findById(id);
      if (adminData.is_admin) {
        next();
      } else {
        return res.status(401).json({
          message: "You do not have admin privileges",
        });
      }
    } else {
      return res.status(401).json({
        message: "please log in",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = isAdmin;
