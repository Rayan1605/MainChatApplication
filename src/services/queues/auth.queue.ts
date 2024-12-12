// This focuses on the queue for the authentication service.
// It is used to add jobs to the queue for the worker to process. It inherits from the BaseQueue class.


import { BaseQueue} from "@services/queues/base.queus";
import {IAuthJob} from "src/features/auth/interfaces/auth.interface"
import {authWorker} from "@worker/auth.worker";
class AuthQueue extends BaseQueue {
    //  so auth is the name which is used to identify and manage a specific set of task within Redis
    // Then we add it to the Bull Adapter which is used to manage the queue and we can use it to create a dashboard

    constructor() {
        super('auth');
        this.processJob('addAuthuserToDb', 5, authWorker.addAuthUserToDB);
    }


    // Using the add method in base.queue.ts to add a job to the queue
    public addAuthUserJob(name: string, data: IAuthJob): void {
        this.addJob(name, data)
    }
}

export const authQueue: AuthQueue = new AuthQueue()