import mongoose from "mongoose";
import { config } from "./config"
import Logger from "bunyan";
//export is like saying I have to share my robot
// default is basically saying this is my special robot and if you ask me for one with telling me which one then you get this one

const log: Logger = config.createLogger('database');
export default () => {

    const connect = () => {
        //Returning a promise so we will use then and catch
    mongoose.connect(`${config.DATABASE_URL!}`, {

    }).then(() => {
      log.info("Successfully connected to database");
    }).catch((error) => {
      log.info("Error connecting to database: ", error);
      return process.exit;
    })

    }
    connect();

    mongoose.connection.on('disconnected', connect)

};