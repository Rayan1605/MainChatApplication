//Bull: This is a tool used for managing the queue, making sure tasks are added, processed,
// and completed correctly.
// Logger: This is used to keep a record of what happens in the queue, like when a task is done or
// if there's a problem.
// Bull Board: This is like a dashboard that shows what's happening in the queue,
// so you can see the status of tasks easily.
// Config: This is the settings for how the queue should work.

//a queue is a list where things are added at one end and removed from the other end.
// Just like in the grocery store line:

//to saving to MongoDB, we need to add it to a queue and then from the Queue
// it will be gotten by a worker and send it to mongocb

// This setup is used to process jobs in the queue in a asynchronous way. Bull allows us to create, manage and process
// background jobs efficiently. We used redis to store it because it is fast
import Queue, { Job} from "bull";
import Logger from "bunyan";
import { createBullBoard} from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter'; // help the dashboard to understand the queue
import { ExpressAdapter } from '@bull-board/express'; // allows us to show our dashboard on the browser
import {config} from "@root/config";
import {IAuthJob} from "@root/features/auth/interfaces/auth.interface";

//
type IBaseJobData = | IAuthJob

// A place  to store all the tools we need to manage the queue
let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
    queue: Queue.Queue // Where we keep our taks
    log: Logger; // out notebook for this task list

    constructor(QueueName: string) {
        // Connects to a place called redis where we store our tasks
        this.queue = new Queue(QueueName, `${config.REDIS_HOST}`);
        // Tell the dashboard to show this queue
        bullAdapters.push(new BullAdapter(this.queue));
        // Remove duplicates
        bullAdapters = [...new Set(bullAdapters)];
        serverAdapter = new ExpressAdapter();
        // Where to find the dashboard
        serverAdapter.setBasePath('/queues');

       // Creating the dashboard with all our taks
        createBullBoard({
            queues: bullAdapters,
            serverAdapter
        });
        this.log = config.createLogger(`${QueueName}Queue`);

        // This is used to log when a job is completed
        this.queue.on('global:completed', (jobId: string) => {
            this.log.info(`Job with ID ${jobId} has been completed`);
        })
        // This is used to log when a job fails
        this.queue.on('Completed', (job: Job) => {
            job.remove();
        })
        // This is used to log when a job is stalled
        this.queue.on('global:stalled', (jobId: string) => {
            this.log.error(`Job with ID ${jobId} has been stalled`);
        })

    }

    // Adding a job to the queue
    protected addJob(name: string, data: IBaseJobData): void {
        this.queue.add(name, data, {attempts: 3, backoff: { type: "fixed", delay: 5000} });
    }

    // Processing the job in the queue
    protected processJob(name: string, concurrency: number, callback: Queue.ProcessCallbackFunction<void>): void {
        this.queue.process(name, concurrency, callback);
    }
}

















