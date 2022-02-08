import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import logger from "@src/logger";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/errors/internalError";
import { Rating } from "./rating";
import _ from "lodash";

interface TimeForecast {
    time: string;
    forecast: BeachForecast[];
}

class ForecastProcessingInternalError extends InternalError {
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
    constructor(
        protected stormGlass = new StormGlass(),
        protected RatingService: typeof Rating = Rating
    ) {}

    public async processForecastForBeaches(
        beaches: Beach[]
    ): Promise<TimeForecast[]> {
        try {
            const beachForecast = await this.calculateRating(beaches);
            const timeForecast = this.mapForecastByTime(beachForecast);
            return timeForecast.map((t) => ({
                time: t.time,
                forecast: _.orderBy(t.forecast, ["rating"], ["desc"]),
            }));
        } catch (err) {
            logger.error(err);
            throw new ForecastProcessingInternalError((err as Error).message);
        }
    }

    private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
        const pointsWithCorrectSources: BeachForecast[] = [];
        logger.info(`Preparing the forecast for ${beaches.length} beaches`);

        for (const beach of beaches) {
            const rating = new this.RatingService(beach);
            const points = await this.stormGlass.fetchPoints(
                beach.lat,
                beach.lng
            );
            const enrichedBeachData = this.enrichBeachData(
                points,
                beach,
                rating
            );
            pointsWithCorrectSources.push(...enrichedBeachData);
        }

        return pointsWithCorrectSources;
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
        beach: Beach,
        rating: Rating
    ): BeachForecast[] {
        return points.map((point) => ({
            lat: beach.lat,
            lng: beach.lng,
            name: beach.name,
            position: beach.position,
            rating: rating.getRateForPoint(point),
            ...point,
        }));
    }
}

export {
    Forecast,
    BeachForecast,
    TimeForecast,
    ForecastProcessingInternalError,
};
