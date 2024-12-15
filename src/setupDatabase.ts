import mongoose from "mongoose";
import Logger from "bunyan";
import {config} from "@root/config";
import {redisConnection} from "@services/redis/redis.connection";


const log: Logger = config.createLogger('setupDatabase');
export default () => {

    const connect = () => {
        //Returning a promise so we will use then and catch
    mongoose.connect("mongodb://localhost:27017/chattyApp-Backend", {

    }).then(() => {
      console.log("Successfully connected to database");
      redisConnection.connect();
    }).catch((error) => {
      console.log("Error connecting to database: ", error);
      return process.exit;
    })
    }
    connect();

    mongoose.connection.on("disconnected", connect);
};