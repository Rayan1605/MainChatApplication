import {IAuthDocument} from "@root/features/auth/interfaces/auth.interface";
import {Helpers} from "@root/globels/helpers";
import {AuthModel} from "@root/features/auth/models/auth.schema";

class AuthService {

    // We want to see if the user or email exists in the database
    //Redis only hold the user data so we will be making a request to the database to see if the user or email exists
    // by querying the database
    