import { createTransport } from "nodemailer";

export const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: import.meta.env.NODEMAILER_USER,
    pass: import.meta.env.NODEMAILER_PASS,
  },
});
