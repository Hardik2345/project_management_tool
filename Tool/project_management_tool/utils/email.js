const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text"); // Correct import

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Project Manager <${process.env.EMAIL_FROM || 'noreply@projectmanager.dev'}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hardikparikh19@gmail.com",
        pass: "lcdnrwxcefptnwox", // Use app password if 2FA is enabled
      },
      // Add timeout and connection settings
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      // // Check if email is enabled
      // if (process.env.EMAIL_ENABLED === 'false') {
      //   console.log(`📧 Email sending disabled. Would send: ${subject} to ${this.to}`);
      //   return;
      // }

      // 1) Render HTML based on a pug template
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
      });

      // 2) Define email options
      const mailOptions = {
        from: "hardikparikh19@gmail.com",
        to: this.to,
        subject,
        html,
        text: convert(html), // Fixed: Use convert() instead of fromString()
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
      console.log(`📧 Email sent successfully: ${subject} to ${this.to}`);
    } catch (error) {
      console.error(`❌ Email sending failed: ${error.message}`);
      // Don't throw the error to prevent crashing the server
      // In development, we can continue without email
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Project Management Tool!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
