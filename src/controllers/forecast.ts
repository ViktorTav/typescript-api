import { ClassMiddleware, Controller, Get } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { Beach } from "@src/models/beach";
import { Forecast } from "@src/services/forecast";
import { Request, Response } from "express";

const forecastService = new Forecast();

//Equivalente a usar um app.use("/forecast", forecastRoute),
@Controller("forecast")
@ClassMiddleware(authMiddleware)
class ForecastController {
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
            console.log(err);
            res.status(500).send({ error: "Something went wrong!" });
        }
    }
}

export { ForecastController };
