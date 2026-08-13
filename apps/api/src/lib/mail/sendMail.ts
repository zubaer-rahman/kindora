/* eslint-disable @typescript-eslint/no-explicit-any */
import { transporter } from './mailConfig';
import type { SendMailOptions } from 'nodemailer';

import env from '../../config/env.js';

interface MailOptions extends SendMailOptions {
  template: string;
  context: any;
}

interface IMailContext {
  subject: string;
  data: any;
}

const sendEmail = async (
  receiverEmail: Array<string>,
  context: IMailContext,
  template: string
): Promise<boolean> => {
  try {
    const senderEmail = env.gmail_user || env.smtp_user || 'noreply@kindora.com';
    const mailOptions: MailOptions = {
      from: `"Kindora" <${senderEmail}>`,
      to: receiverEmail,
      subject: context.subject,
      template: template,  
      context: context.data,  
    };

    const reports = await transporter.sendMail(mailOptions);
    console.log(reports);
    return true;
  } catch (err) {
    console.log(err);
    console.log('EMAIL SEND FAILED');
    return false;
  }
};

export default sendEmail;
