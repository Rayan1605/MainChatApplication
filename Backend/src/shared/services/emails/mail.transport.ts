import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '../../../config';
import { BadRequestError } from '../../globals/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    try {
      const transporter: Mail = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: config.SENDER_EMAIL!,
          pass: config.SENDER_EMAIL_PASSWORD!
        }
      });

      const mailOptions: IMailOptions = {
        from: `Chatty App <${config.SENDER_EMAIL!}>`,
        to: receiverEmail,
        subject,
        html: body
      };

      await transporter.sendMail(mailOptions);
      log.info('Development email sent successfully.');
    } catch (error) {
      log.error('Development email sending failed:', error);
      // Don't throw error in development - just log it and continue
      log.info('Continuing without sending email (development mode)');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    try {
      const mailOptions: IMailOptions = {
        from: `Chatty App <${config.SENDER_EMAIL!}>`,
        to: receiverEmail,
        subject,
        html: body
      };

      log.info(`Attempting to send email from: ${config.SENDER_EMAIL!} to: ${receiverEmail}`);
      await sendGridMail.send(mailOptions);
      log.info('Production email sent successfully.');
    } catch (error: any) {
      log.error('Production email sending failed:', error);
      
      // Log detailed SendGrid error information
      if (error.response && error.response.body && error.response.body.errors) {
        log.error('SendGrid error details:', JSON.stringify(error.response.body.errors, null, 2));
      }
      
      if (error.code === 403) {
        log.error('403 Forbidden - This usually means:');
        log.error('1. Sender email not verified in SendGrid');
        log.error('2. API key lacks Mail Send permissions');
        log.error('3. Account restrictions');
        log.error(`Current sender email: ${config.SENDER_EMAIL!}`);
      }
      
      // In production, we might want to retry or handle differently
      // For now, just log the error and don't crash the app
      log.info('Email sending failed but continuing application operation');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
