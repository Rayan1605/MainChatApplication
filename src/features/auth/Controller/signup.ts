import { ObjectId} from "mongodb";
import {Request, Response} from "express";
import {joiValidation} from "@root/globels/Joi-Validation/Validation";
import { signupSchema } from "@root/features/auth/schemes/signup";
import {IAuthDocument, ISignUpData} from "@root/features/auth/interfaces/auth.interface";
import {authService} from "@services/DB/AuthService";
import {BadRequestError} from "@root/globels/error-handler";
import {Helpers} from "@root/globels/helpers";
import {UploadApiResponse} from "cloudinary";
import {uploads} from "@root/globels/cloudinary-upload";
import HTTP_STATUS from "http-status-codes";
import {UserCache} from "@services/redis/user.cache";
import {IUserDocument} from "@root/features/user/models/user.interface";
//Delete properties from an object
import { omit} from 'lodash'
import {authQueue} from "@services/queues/auth.queue";
import {userQueue} from "@services/queues/user.queue";
const userCache: UserCache = new UserCache();

export class Signup {
    //Joi validation is to ensure that data conforms to a specific structure and set of rules before
    // it's processed by your application or stored in your database
    @joiValidation(signupSchema)
    public async signup(req: Request, res: Response): Promise<void> {
     const { username, email, password, avatarColor, avatarImage} = req.body;
     const CheckifUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);

         if (CheckifUserExist) {
             throw new BadRequestError("User already exist");
         }

         const authObjectId: ObjectId = new ObjectId();
         const userObjectId: ObjectId = new ObjectId();
         const uid = `${Helpers.generateRandomColor(12)}`
         const authData: IAuthDocument = Signup.prototype.signupData({

                _id: authObjectId,
                uId: uid,
                username,
                email,
                password,
                avatarColor
         });
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`,true,true) as UploadApiResponse;

     if (!result?.public_id) {
         throw new BadRequestError("Error occurred: File upload failed. Try again");
     }


     // Add to redis cache
   const userDataForCache: IUserDocument = Signup.prototype.userData(authData, userObjectId);
   userDataForCache.profilePicture = `https://res/cloudinary.com/${process.env.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
   await userCache.saveUserToCache(`${userObjectId}`, uid, userDataForCache);

   //Add to Database
        // We don't want to save the password in the database so we omit it
   omit(userDataForCache, ['_Id', 'username', 'email','avatarColor', 'password']);
   //This line adds a job to authQueue to insert a user into a database, specified by 'addAuthuserToDb'.
        // It passes userDataForCache, which excludes sensitive fields, as data for the job.
        // Job queues enable asynchronous processing for efficient task handling, such as database operations.
   authQueue.addAuthUserJob('addAuthuserToDb', { value: userDataForCache})
        userQueue.addUserJob('addUserJob', { value: userDataForCache})

        res.status(HTTP_STATUS.CREATED).json({message: "User created successfully", authData});

    }

    private signupData(data: ISignUpData): IAuthDocument {
        const {_id, username, email, uId,password, avatarColor} = data;
        return {
            _id,
            uId,
            username: Helpers.firstletter(username),
            email: Helpers.lowerEmail(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as unknown as IAuthDocument;
    }
    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id: userObjectId,
            authId: _id,
            uId,
            username: Helpers.firstletter(username),
            email,
            password,
            avatarColor,
            profilePicture: '',
            blocked: [],
            blockedBy: [],
            work: '',
            location: '',
            school: '',
            quote: '',
            bgImageVersion: '',
            bgImageId: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            notifications: {
                messages: true,
                reactions: true,
                comments: true,
                follows: true
            },
            social: {
                facebook: '',
                instagram: '',
                twitter: '',
                youtube: ''
            }
        } as unknown as IUserDocument;
    }

}
