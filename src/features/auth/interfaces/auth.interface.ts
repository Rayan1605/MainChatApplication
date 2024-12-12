import { Document} from "mongoose";
import { ObjectId} from "mongodb";
import { IUserDocument} from "@root/features/user/models/user.interface";

declare global {
     //
     namespace Express {
         // interface Request  is used to add a new property to the Request object
         // changes the Express framework (used for making web applications) to include a new piece of
         // user information in each request. This means whenever a request is made (like loading a page),
         // it can include data about the logged-in user, but only if someone is logged in.

         interface Request {
             currentUser?: AuthPayload; //This will be in error if no user logged in so I made it optional so no
             // error will be thrown
         }
     }
 }

 //This is a set of rules for what information about the user needs to be available
// (like their email and username).
 export interface AuthPayload {

   userId: string;
   uId: string;
    email: string;
    username: string;
    avatarColor: string
     iat: number;
 }

 //This is more rules, but for user information stored in the database,
// including functions for checking passwords and making passwords safe to store
 export interface IAuthDocument extends Document {
     _id: string | ObjectId;
     uId: string;
     username: string;
     email: string;
     password?: string; // This is optional because we don't want to return the password
     avatarColor: string;
     createdAt: Date;
     comparePassword(password: string): Promise<boolean>;
     hashPassword(password: string): Promise<string>;
 }
 // This is  the data required from users when they register below.

 export interface ISignUpData {
     _id: ObjectId;
     uId: string;
     email: string;
     username: string;
     password: string;
     avatarColor: string;
 }

 // This is the data required from users when they log in below which is simply the IAuthDocument or a string

    export interface ILoginData {
     value?: string | IAuthDocument;
    }

export interface IAuthJob {
    value?: string | IAuthDocument | IUserDocument;
}