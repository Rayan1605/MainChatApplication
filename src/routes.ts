import { Application } from 'express';
import {authRoutes} from "@root/features/auth/routes/authRoutes";
import {serverAdapter} from "@services/queues/base.queus";

const BASE_PATH = '/api/v1';
export default (app: Application)  => {

    const routes = () => {
        app.use("/queues", serverAdapter.getRouter());
        app.use(BASE_PATH, authRoutes.routes());
    };

    routes();

}