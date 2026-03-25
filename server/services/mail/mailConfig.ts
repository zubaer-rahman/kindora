import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import handlebarOptions from "./viewEngine";

import type SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Use Gmail with App Password if GOOGLE_APP_PASSWORD is set (recommended for Gmail).
 * Otherwise use generic SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
 *
 * Gmail App Password: Google Account → Security → 2-Step Verification → App passwords → Mail.
 */
const transportOptions: SMTPTransport.Options = process.env.GOOGLE_APP_PASSWORD
  ? {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || process.env.SMTP_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    }
  : {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

export const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
  nodemailer.createTransport(transportOptions);

transporter.use("compile", hbs(handlebarOptions));
