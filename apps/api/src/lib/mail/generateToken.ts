import jwt from "jsonwebtoken";
import { PASSWORD_RESET, VERIFY_EMAIL_TEMPLATE } from "./constants.js";
import sendEmail from "./sendMail.js";
import env from "../../config/env.js";

export const generateTokenAndSendMail = async (
  user: {
    _id: { toString: () => string } | string;
    email: string;
    role?: string;
    name?: string;
    firstName?: string;
  },
  templateFor: string
) => {
  try {
    const firstName =
      (user as { firstName?: string }).firstName ??
      (user as { name?: string }).name?.split(" ")[0] ??
      "User";
    const supportUrl =
      process.env.SUPPORT_URL || process.env.CLIENT_URL || "https://example.com";

    const clientUrl =
      process.env.CLIENT_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const logoUrl = `${clientUrl}/KINDORA.svg`;

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      env.jwt_secret || env.nextauth_secret!,
      { expiresIn: "24h" }
    );

    const emailTemplate =
      templateFor === "Password Reset" ? PASSWORD_RESET : VERIFY_EMAIL_TEMPLATE;

    const baseUrl =
      templateFor === "Password Reset"
        ? `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`
        : `${clientUrl}/verify?token=${encodeURIComponent(token)}`;

    await sendEmail(
      [user.email],
      {
        subject:
          templateFor === "Password Reset"
            ? "Password Reset - Kindora"
            : "Verify your email - Kindora",
        data: {
          firstName,
          token: baseUrl,
          supportUrl,
          logoUrl,
        },
      },
      emailTemplate
    );
  } catch (error) {
    console.error("Error generating token or sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};