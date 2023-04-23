const nodemailer = require("nodemailer");
const dev = require("../config");

exports.sendEmailWithNodeMailer = async (emailData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: dev.app.smtpUsername,
        pass: dev.app.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: dev.app.smtpUsername,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("SMTP ERROR1");
        console.log(error);
      } else {
        console.log("message sent: %s", info.response);
      }
    });
  } catch (error) {
    console.log("SMTP ERROR2");
    console.log("Problem sending email:", error);
  }
};
