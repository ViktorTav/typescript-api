import { ClassMiddleware, Controller, Get } from "@overnightjs/core";
import logger from "@src/logger";
import { authMiddleware } from "@src/middlewares/auth";
import { Beach } from "@src/models/beach";
import { Forecast } from "@src/services/forecast";
import { Request, Response } from "express";
import { BaseController } from ".";

const forecastService = new Forecast();

//Equivalente a usar um app.use("/forecast", forecastRoute),
@Controller("forecast")
@ClassMiddleware(authMiddleware)
class ForecastController extends BaseController {
    //Equivalente a usar um router.get("/",(req,res)=>forecastController.getForecastForLoggedUser(req,res))
    @Get("")
    public async getForecastForLoggedUser(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const beaches = await Beach.find({ user: req.decoded?.id });
            const forecastData =
                await forecastService.processForecastForBeaches(beaches);
            res.status(200).send(forecastData);
        } catch (err) {
            logger.error(err);
            this.sendErrorResponse(res, {
                code: 500,
                message: "Something went wrong!",
            });
        }
    }
}

export { ForecastController };
