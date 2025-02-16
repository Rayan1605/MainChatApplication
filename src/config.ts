//These are used to organize and manage configuration settings for application
//These can include things like database connection or API keys
//It good to have this because we can change, define and access these setting throughout our application

//The dotenv package is used to read the .env file and make those values available to the application
import dotenv from "dotenv";
import bunyan from "bunyan";
import cloudinary from "cloudinary";

dotenv.config({}); // read .env file

// The | symbol is used to define a type that can be one of several types so it can be string or undefined
class Config {

    public DATABASE_URL: string | undefined;
    public JWT_TOKEN: string | undefined;
    public SECRET_KEY_ONE: string | undefined;
    public SECRET_KEY_TWO: string | undefined;
    public CLIENT_URL: string | undefined;
    public NODE_ENV: string | undefined;
    public REDIS_HOST: string | undefined;
    public CLOUD_NAME: string | undefined;
    public CLOUD_API_KEY: string | undefined;
    public CLOUD_API_SECRET: string | undefined;

  private readonly DEFAULT_DATABASE_URL =   ' mongodb://localhost:27017/chattyApp-Backend'
    constructor() {
        this.DATABASE_URL = process.env.DATABASE_URL || this.DEFAULT_DATABASE_URL;
        this.JWT_TOKEN = process.env.JWT_TOKEN || "1234";
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || "";
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || "";
        this.CLIENT_URL = process.env.CLIENT_URL || "";
        this.NODE_ENV = process.env.NODE_ENV || "";
        this.REDIS_HOST = process.env.REDIS_HOST || "";
        this.CLOUD_NAME = process.env.CLOUD_NAME || "";
        this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || "";
        this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || "";

    }

    public createLogger(name: string): bunyan {
        return bunyan.createLogger({name, level: 'debug' });
    }

    // To make sure that all the configuration settings are defined
    public validateConfig(): void {
      console.log(this)
     for (const [key, value] of Object.entries(this)) // this is referring to the object that is being created
         //We are checking every object and if it is undefined then we throw an error
     {
         if (value === undefined) {
             throw new Error(`Missing configuration for ${key}`);
         }
     }
  }
//The cloudinary.v2.config({}) function is part of the Cloudinary library for Node.js, and it's used to configure the Cloudinary SDK with your account details
  public cloudinaryConfig(): void {
      cloudinary.v2.config({
          cloud_name: this.CLOUD_NAME,
            api_key: this.CLOUD_API_KEY,
            api_secret: this.CLOUD_API_SECRET

      })
  }

}

export const config: Config = new Config(); // create config object








