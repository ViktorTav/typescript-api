import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config, { IConfig } from "config";
import { User } from "@src/models/user";

const authConfig: IConfig = config.get("App.auth");

interface DecodedUser extends Omit<User, "_id"> {
    id: string;
}

class AuthService {
    public static async hashPassword(
        password: string,
        salt = 10
    ): Promise<string> {
        return await bcrypt.hash(password, salt);
    }

    public static async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public static generateToken(payload: object): string {
        return jwt.sign(payload, authConfig.get("secret"), {
            expiresIn: authConfig.get("token.expiresIn"),
        });
    }

    public static decodeToken(token: string): DecodedUser {
        return jwt.verify(token, authConfig.get("secret")) as DecodedUser;
    }
}

export { AuthService, DecodedUser };
