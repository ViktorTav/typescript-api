import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";

//Equivalente a usar um app.use("/forecast", forecastRoute),
@Controller("forecast")
class ForecastController {
    //Equivalente a usar um router.get("/",(req,res)=>forecastController.getForecastForLoggedUser(req,res))
    @Get("")
    //Quando não queremos utilizar um parâmetro no typescript, podemos utilizar _(underline) para ignorá-lo
    public getForecastForLoggedUser(_: Request, res: Response): void {
        res.send([
            {
                time: "2020-04-26T00:00:00+00:00",
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: "Manly",
                        position: "E",
                        rating: 2,
                        swellDirection: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 3.89,
                        time: "2020-04-26T00:00:00+00:00",
                        waveDirection: 231.38,
                        waveHeight: 0.47,
                        windDirection: 299.45,
                    },
                ],
            },
            {
                time: "2020-04-26T01:00:00+00:00",
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: "Manly",
                        position: "E",
                        rating: 2,
                        swellDirection: 123.41,
                        swellHeight: 0.21,
                        swellPeriod: 3.67,
                        time: "2020-04-26T01:00:00+00:00",
                        waveDirection: 232.12,
                        waveHeight: 0.46,
                        windDirection: 310.48,
                    },
                ],
            },
        ]);
    }
}

export { ForecastController };
