import {IAuthDocument} from "@root/features/auth/interfaces/auth.interface";
import {Helpers} from "@root/globels/helpers";
import {AuthModel} from "@root/features/auth/models/auth.schema";

class AuthService {

    // We want to see if the user or email exists in the database
    //Redis only hold the user data so we will be making a request to the database to see if the user or email exists
    // by querying the database
    public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
        $or: [
            {username: Helpers.firstletter(username)},
            {email: Helpers.lowerEmail(email)}
        ]
    }
    // We are using the findOne method to find the first document that matches the query and we are using the exec method to execute the query
    // we are looking in MongoDB for the user or email
    const user: IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument;
    return user;
    }

    public async addAuthUserToDb(data: IAuthDocument): Promise<void> {

        await AuthModel.create(data);
    }

}
export const authService: AuthService = new AuthService();