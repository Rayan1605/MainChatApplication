import {UserModel} from "@root/features/user/models/user.schema";
import {IUserDocument} from "@root/features/user/models/user.interface";

class UserService {
    public async addUserData(data: IUserDocument): Promise<void> {
        await UserModel.create(data);
    }

}

export const userService: UserService = new UserService();