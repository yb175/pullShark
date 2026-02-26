import nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email app password from .env
  },
});

export default async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"PullShark" <${process.env.EMAIL_USER}>`, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${to} with subject "${subject}"`);
}