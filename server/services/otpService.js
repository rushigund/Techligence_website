import nodemailer from "nodemailer";

const otps = new Map(); // 

export function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, length);
}

export function saveOTP(email, otp) {
  otps.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 minutes expiry
}

export function verifyOTP(email, inputOtp) {
  const record = otps.get(email);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otps.delete(email);
    return false;
  }

  const isValid = record.otp === inputOtp;
  if (isValid) otps.delete(email); // remove after use
  return isValid;
}
export async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
const mailOptions = {
  from: `"Techligence Pvt. Ltd." <${process.env.SMTP_USER}>`,
  to: email,
  subject: " One Time password for your  Payment",
  text: `Thank you for showing your interest . Use the following OTP to verify your identity: ${otp}. Do not share this code with anyone.  `,
};

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(` Email sent to ${email}. MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(" Failed to send email:");
    console.error(err);
    throw err; // bubble up the error to be caught in the router
  }
}
