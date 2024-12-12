import { BaseQueue} from "@services/queues/base.queus";
import { userWorker} from "@worker/user.worker";

class UserQueue extends BaseQueue {
    constructor() {
     super("user")
        this.processJob("addUserToDB", 5, userWorker.addAUserToDB)

    }

    public addUserJob(name: string, data: any): void {
        this.addJob(name, data)
    }
}

export const userQueue: UserQueue = new UserQueue();