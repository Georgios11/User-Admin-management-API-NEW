const bcrypt = require("bcryptjs");
const saltRounds = 10;

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
  }
};
const comparePassword = async (userInput, hashedPassword) => {
  try {
    return await bcrypt.compare(userInput, hashedPassword);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { securePassword, comparePassword };
