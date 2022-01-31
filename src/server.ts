import "./util/module-alias";

import bodyParser from "body-parser";
import { Server } from "@overnightjs/core";
import { Application } from "express";

import { ForecastController } from "./controllers/forecast";
import * as database from "@src/database";
import { BeachesController } from "./controllers/beaches";
import { UsersController } from "./controllers/users";

class SetupServer extends Server {
    constructor(private port = 3000) {
        super();
    }

    public async init(): Promise<void> {
        this.setupExpress();
        this.setupControllers();
        await this.databaseSetup();
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.info(`Server listening of port: ${this.port}`);
        });
    }

    public getApp(): Application {
        return this.app;
    }

    public async close(): Promise<void> {
        await database.close();
    }

    private setupExpress(): void {
        this.app.use(bodyParser.json());
    }

    private setupControllers(): void {
        const forecastController = new ForecastController();
        const beachesController = new BeachesController();
        const usersController = new UsersController();

        //O método addControllers vem da classe Server do Overnightjs
        this.addControllers([
            forecastController,
            beachesController,
            usersController,
        ]);
    }

    private async databaseSetup(): Promise<void> {
        await database.connect();
    }
}

export { SetupServer };
