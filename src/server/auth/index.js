import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP, admin } from "better-auth/plugins";
import { db } from "../db";
import { transporter } from "../emails";

export const auth = betterAuth({
  secret: import.meta.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await transporter.sendMail({
            from: `"College Project" <${process.env.NODEMAILER_USER}>`,
            to: email,
            subject: "Email verfication",
            text: `Verify your email with this otp: ${otp}. Don't share it with anyone.`,
          });
        }
      },
    }),
  ],
});
