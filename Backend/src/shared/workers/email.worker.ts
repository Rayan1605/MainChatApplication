import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '../../config';
import { mailTransport } from '../services/emails/mail.transport';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      await mailTransport.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('Email worker error:', error);
      // Don't fail the job completely - just log the error and mark as done
      // This prevents the app from crashing when email sending fails
      log.info('Email job completed with errors but continuing');
      done(null, job.data);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
