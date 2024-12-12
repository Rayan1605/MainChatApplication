import {DoneCallback, Job} from 'bull';
import Logger from 'bunyan';
import {config} from "@root/config";
import {Error} from "mongoose";
import {authService} from "@services/DB/AuthService";

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
    async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
        try {
            log.info('Adding user to database');
            const value = job.data.value // our data is held in this variable
            // add method to send to database
            await authService.addAuthUserToDb(value); // this is used to add the user to the database
            job.progress(100) // this is used to show the progress of the job

            done(null, job.data);
        } catch (error) {
            log.error({error}, 'Error adding user to database');
            done(error as Error);
        }
    }

}

export const authWorker : AuthWorker = new AuthWorker();