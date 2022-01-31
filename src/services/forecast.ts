import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/errors/internalError";

interface TimeForecast {
    time: string;
    forecast: BeachForecast[];
}

class ProcessingInternalError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            "Unexpected error during the forecast processing";
        super(`${internalMessage}:${message}`);
    }
}

/*
    O tipo Omit do typescript nos permite criar um novo tipo com alguma(s) propriedades 
    omitidas de outro tipo  
*/
interface BeachForecast extends Omit<Beach, "user">, ForecastPoint {}

class Forecast {
    //Injeção de dependência
    constructor(protected stormGlass = new StormGlass()) {}

    public async processForecastForBeaches(
        beaches: Beach[]
    ): Promise<TimeForecast[]> {
        try {
            const pointsWithCorrectSources: BeachForecast[] = [];

            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(
                    beach.lat,
                    beach.lng
                );
                const enrichedBeachData = this.enrichBeachData(points, beach);
                pointsWithCorrectSources.push(...enrichedBeachData);
            }

            return this.mapForecastByTime(pointsWithCorrectSources);
        } catch (err) {
            throw new ProcessingInternalError((err as Error).message);
        }
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = [];

        for (const point of forecast) {
            const timePoint = forecastByTime.find((f) => f.time === point.time);

            if (timePoint) {
                timePoint.forecast.push(point);
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point],
                });
            }
        }

        return forecastByTime;
    }

    private enrichBeachData(
        points: ForecastPoint[],
        beach: Beach
    ): BeachForecast[] {
        return points.map((e) => ({
            lat: beach.lat,
            lng: beach.lng,
            name: beach.name,
            position: beach.position,
            rating: 1,
            ...e,
        }));
    }
}

export { Forecast, BeachForecast, TimeForecast, ProcessingInternalError };
