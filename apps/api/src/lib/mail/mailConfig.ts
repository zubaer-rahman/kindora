import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import handlebarOptions from "./viewEngine.js";
import env from "../../config/env.js";

import type SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Use Gmail with App Password if GOOGLE_APP_PASSWORD is set (recommended for Gmail).
 * Otherwise use generic SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
 */
const transportOptions: SMTPTransport.Options = env.google_app_password
  ? {
      service: "gmail",
      auth: {
        user: env.gmail_user || env.smtp_user,
        pass: env.google_app_password,
      },
    }
  : {
      host: env.smtp_host,
      port: env.smtp_port,
      auth: {
        user: env.smtp_user,
        pass: env.smtp_password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

export const transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> =
  nodemailer.createTransport(transportOptions);

transporter.use("compile", hbs(handlebarOptions as any));
