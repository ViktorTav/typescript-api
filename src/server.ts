import "./util/module-alias";
import bodyParser from "body-parser";
import { Server } from "@overnightjs/core";
import { ForecastController } from "./controllers/forecast";
import { Application } from "express";

class SetupServer extends Server {
    constructor(private port = 3000) {
        super();
    }

    //Métodos públicos:

    public init(): void {
        this.setupExpress();
        this.setupControllers();
    }

    public getApp(): Application {
        return this.app;
    }

    //Métodos privados:

    private setupExpress(): void {
        this.app.use(bodyParser.json());
    }

    private setupControllers(): void {
        const forecastController = new ForecastController();

        //O método addControllers vem da classe Server do Overnightjs
        this.addControllers([forecastController]);
    }
}

export { SetupServer };
