/* eslint-disable @typescript-eslint/no-explicit-any */
import { transporter } from './mailConfig';
import type { SendMailOptions } from 'nodemailer';

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
    const mailOptions: MailOptions = {
      from: 'Email Verification',
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
