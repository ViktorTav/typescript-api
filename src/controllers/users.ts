import { Controller, Post } from "@overnightjs/core";
import { User } from "@src/models/user";
import { AuthService } from "@src/services/auth";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { BaseController } from ".";

@Controller("users")
class UsersController extends BaseController {
    @Post("")
    public async create(req: Request, res: Response) {
        try {
            const user = new User(req.body);
            const newUser = await user.save();
            res.status(201).send(newUser);
        } catch (err) {
            this.sendCreateUpdateErrorResponse(res, err);
        }
    }

    @Post("authenticate")
    public async authenticate(
        req: Request,
        res: Response
    ): Promise<Response | void> {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({
                code: 401,
                error: "User not found!",
            });
        }

        if (!(await AuthService.comparePassword(password, user.password))) {
            return res.status(401).send({
                code: 401,
                error: "Password doesn't match!",
            });
        }

        const token = AuthService.generateToken(user.toJSON());

        res.status(200).send({ token });
    }
}

export { UsersController };
