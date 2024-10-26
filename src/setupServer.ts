// Application - Main Express app object
// json, urlencoded - Parse request body data
// Response - HTTP response sent to client
// Request - HTTP request received from client
// NextFunction - Pass to next middleware function

//on - This reads and understands JSON data from request bodies.
// urlencoded - This reads and understands URL-encoded data from request bodies.


//The ChattyServer class configures and starts an Express application.
// It sets up middleware functions for security, standard features, routes, and global error handling.
// It starts an HTTP server and Socket.IO for realtime communication.

//Middleware are functions that run between receiving a request and sending a response
//Imagine you're at a playground, and you want to send a message to your friend on the other side of the playground. Middleware is like the series of talking tubes you might use to send your message through. You speak into one end of the tube, the message travels through the twists and turns, and then it comes out near your friend.
//
// In the world of computers, middleware is like those talking tubes, but for data and requests. When you use an app on your phone or computer, you're sending requests. Middleware is the software in the middle that takes your request, makes sure it gets to where it needs to go in the computer or network, maybe adds some information or translates it into a different "language" if needed, and then sends back the response to you.
//
// So, middleware helps different parts of a computer program or different programs to talk to each other smoothly, just like those talking tubes help you and your friend communicate across the playground.
//
// Answer Again
// Search Web
import { Application, json, urlencoded, Response, Request, NextFunction}  from  'express';
import * as http from "http";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookierSession from "cookie-session";
import compression from "compression";
import HTTP_STATUS from "http-status-codes";
import 'express-async-errors'

const SERVER_PORT = 5000; // port for HTTP server
export class ChattyServer {
    //The constructor takes in an Express Application object
   private app: Application;
       constructor(app: Application) {
           this.app = app;
       }

       public start(): void {
           this.securityMiddlewares(this.app);
           this.standardMiddlewares(this.app);
           this.routeMiddlewares(this.app);
           this.globalErrorHandler(this.app);
           this.startServer(this.app);
       }

       //The start method configures the middlewares and starts the server.

    // securityMiddlewares sets up security related middleware.

    // standardMiddlewares sets up middleware for standard app features.

    // routeMiddlewares sets up middleware for API routes.

    // globalErrorHandler handles errors from all parts of the app.

    // startServer starts the HTTP server using the Express app.

    // createSocketIO initializes Socket.IO for realtime communication.

    // startHttpServer starts listening on a port for HTTP requests.

    //             cors ->Allows requests to your app from other domains. Makes CORS errors go away.
    //             helmet - Adds security headers to responses. Helps prevent attacks
    //              hpp - Protects against HTTP parameter pollution. Stops bad query strings from breaking your app.
    //             cookie-session - Stores session data in the cookie. Allows you to access session data
    //            compression - Compresses responses to reduce size.
    //
          private securityMiddlewares(app:Application): void {

           app.use(
               cookierSession({
                     name: 'session', // load balance on aws will need this name
                     keys: ["test1","test2"],
                     maxAge: 24 * 7 * 3600000, // valid for 7 days
                     secure: false, // set to true in production when using https
               })
           );
           app.use(hpp()); // protect against http parameter pollution attacks
              app.use(helmet()); // set security-related HTTP headers
                app.use(
                    cors({
                        origin: "*",
                        credentials: true, // allow cookies from client so MUST be true
                        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 200
                        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow these verbs
                    })); // enable cors
          }

         private standardMiddlewares(app:Application): void {
             app.use(compression()); // compress all responses
             app.use(json({limit: '50mb'})); // parse json in request body
             app.use(urlencoded({limit: '50mb', extended: true})); // parse urlencoded in request body

         }


         private routeMiddlewares(app:Application): void {}

    //Below will handle every error in the application weather in our features or controller
          private globalErrorHandler(app:Application): void {}
          private  async startServer(app:Application): Promise<void>  {

           try{
               const httpServer: http.Server = new http.Server(app);
               this.startHttpServer(httpServer);
           }catch (e) {
               console.error(e);
           }
          }
          private createSockerIO(httpServer: http.Server): void {}

          private startHttpServer(httpServer: http.Server): void {
           //Will listen on port 5000
            httpServer.listen(SERVER_PORT, () => {
                console.log(`Server started on port ${SERVER_PORT}`);
            })

          }

}
