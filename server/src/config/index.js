require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 3001,
    jwtSecretKey: process.env.JTW_SECRET_KEY,
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    sessionSecretKey: process.env.SESSION_SECRET_KEY,
  },
  db: {
    url:
      process.env.MONGO_URL || "mongodb://127.0.0.1:27017/user-admin-db-repeat",
  },
};
module.exports = dev;
