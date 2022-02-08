import { Controller, Get, Middleware, Post } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
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
            return this.sendErrorResponse(res, {
                code: 401,
                message: "User not found!",
            });
        }

        if (!(await AuthService.comparePassword(password, user.password))) {
            return this.sendErrorResponse(res, {
                code: 401,
                message: "Password doesn't match!",
            });
        }

        const token = AuthService.generateToken(user.toJSON());

        res.status(200).send({ token });
    }

    @Get("me")
    @Middleware(authMiddleware)
    public async me(req: Request, res: Response): Promise<Response> {
        const email = req?.decoded?.email;
        const user = await User.findOne({ email });

        if (!user) {
            return this.sendErrorResponse(res, {
                code: 404,
                message: "User not found!",
            });
        }

        return res.send({ user });
    }
}

export { UsersController };
