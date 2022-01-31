import { AuthService } from "@src/services/auth";
import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

function authMiddleware(
    req: Partial<Request>,
    res: Partial<Response>,
    next: NextFunction
): void {
    const token = req.headers?.["x-access-token"];
    try {
        const decodedToken = AuthService.decodeToken(token as string);

        req.decoded = decodedToken;
        next();
    } catch (err) {
        if (err instanceof JsonWebTokenError) {
            res.status?.(401).send({ code: 401, error: err.message });
            return;
        }

        res.status?.(500).send({ code: 500, error: "Something went wrong!" });
    }
}

export { authMiddleware };
