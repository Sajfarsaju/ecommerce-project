const nodeMailer = require("nodemailer");
const dotenv = require('dotenv')
dotenv.config()

const sendMailOTP = async (userEmail, userName, otp, reasonForOtp) => {

  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.APP_PASS
      },
    });
    const mailOptions = {
      from: "OutFitHub",
      to: userEmail,
      subject: `Otp verification for ${reasonForOtp}`,
      html: `
      <p>Hello ${userName},</p>
      <p>Your OTP for ${reasonForOtp} verification is: <strong>${otp}</strong></p>
      <p>Please use this code to complete the ${reasonForOtp} process.</p>
      <p>If you didn't request this OTP or have any concerns, please ignore this message.</p>
    `,
    };
    const info = await transporter.sendMail(mailOptions);
    if (info) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error sending mail:', error);
    return { success: false };
  }
}

module.exports = sendMailOTP