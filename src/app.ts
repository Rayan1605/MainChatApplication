import express, {Express} from "express";

import {ChattyServer} from "./setupServer";
import SetupDatabase from "@root/setupDatabase";
import setupDatabase from "@root/setupDatabase";
import {config} from "@root/config";

class Application {
    public initialize(): void {
        this.loadConfig();
        const app = express(); // create express app
        const server:ChattyServer = new ChattyServer(app); // create server
         setupDatabase(); // setup database
        server.start();// start server
    }

    private loadConfig() {
        config.validateConfig()
        config.cloudinaryConfig()
    }
}

const application:Application = new Application();
application.initialize(); // initialize application