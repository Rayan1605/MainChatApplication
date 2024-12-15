import { IAuthDocument} from "@root/features/auth/interfaces/auth.interface";
import { model, Model, Schema} from "mongoose";
import { hash, compare} from "bcrypt";

const SALT_ROUND = 10;
//what data is inside our database
    const authSchema: Schema = new Schema({

        username: { type: String},
        uId: {type: String},
        email: { type: String, unique: true},
        password: { type: String},
        avatarColor: { type: String},
        createdAt: { type: Date, default: Date.now}
    },
        {
            toJSON: {
                transform(_doc, ret){
                    delete ret.password;
                    return ret;
                }
            }
        }
)

// Before saving the password, we hash it and that what the code is doing below

authSchema.pre("save", async function (this: IAuthDocument, next: () => void) {
    const hashedPassword: string = await hash(this.password as string, SALT_ROUND);
    this.password = hashedPassword;
    next();
})

// This is a method that is used to compare the password that is being passed in with the password that is stored in the database
authSchema.methods.comparePassword = async function ( password: string): Promise<boolean> {
    const hashedPassword: string = (this as unknown as IAuthDocument).password!;
    return compare(password, hashedPassword);
}
// This is a method that is used to hash the password that is being passed in
authSchema.methods.hashPassword = async function (password: string): Promise<string> {
    return hash(password, SALT_ROUND);
}
// This is the model that is used to create the document
const AuthModel: Model<IAuthDocument> = model<IAuthDocument>("Auth", authSchema, "auth");
 export { AuthModel }