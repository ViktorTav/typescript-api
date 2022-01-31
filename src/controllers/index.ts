import { CUSTOM_VALIDATION } from "@src/models/user";
import { Response } from "express";
import mongoose, { Error } from "mongoose";

abstract class BaseController {
    protected sendCreateUpdateErrorResponse(
        res: Response,
        error: unknown
    ): void {
        //Type narrowing
        if (error instanceof mongoose.Error.ValidationError) {
            const clientErrors = this.handleClientErrors(error);

            res.status(clientErrors.code).send({
                code: clientErrors.code,
                error: clientErrors.error,
            });
        } else {
            res.status(500).send({ error: "Something went wrong!" });
        }
    }

    private handleClientErrors(error: mongoose.Error.ValidationError): {
        code: number;
        error: string;
    } {
        const duplicatedKindErrors = Object.values(error.errors).filter(
            (err) =>
                err.name === "ValidatorError" &&
                err.kind === CUSTOM_VALIDATION.DUPLICATED
        );

        if (duplicatedKindErrors.length) {
            return {
                code: 409,
                error: error.message,
            };
        }

        return {
            code: 422,
            error: error.message,
        };
    }
}

export { BaseController };
