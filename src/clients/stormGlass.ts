import { InternalError } from "@src/util/errors/internalError";
import config, { IConfig } from "config";

/*
    Ao importarmos um módulo dessa maneira (* as foo), criamos uma espécie de namespace, 
    dessa maneira evitando conflito de nomes de classes, funções, variáveis, etc...
*/
import * as HTTPUtil from "@src/util/request";

interface StormGlassPointSource {
    [key: string]: number;
}

interface StormGlassPoint {
    readonly time: string;
    readonly swellDirection: StormGlassPointSource;
    readonly swellHeight: StormGlassPointSource;
    readonly swellPeriod: StormGlassPointSource;
    readonly waveDirection: StormGlassPointSource;
    readonly waveHeight: StormGlassPointSource;
    readonly windDirection: StormGlassPointSource;
    readonly windSpeed: StormGlassPointSource;
}

interface StormGlassForecastResponse {
    hours: StormGlassPoint[];
}

interface ForecastPoint {
    time: string;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    waveDirection: number;
    waveHeight: number;
    windDirection: number;
    windSpeed: number;
}

/**
 * Tipo de erro utilizado quando algo quebra antes que requisição chegue a api do StormGlass.
 * Ex: Network Error
 */
class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage = `Unexpected error when to trying to communicate to StormGlass`;
        super(`${internalMessage}: ${message}`);
    }
}

/**
 * Tipo de erro utilizado quando a requisição falha com algum status code 4xx/5xx
 */
class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage = `Unexpected error returned by to StormGlass service`;
        super(`${internalMessage}: ${message}`);
    }
}

const stormGlassResourceConfig: IConfig = config.get(
    "App.resources.StormGlass"
);

class StormGlass {
    readonly stormGlassAPIParams =
        "swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed";

    readonly stormGlassAPISource = "noaa";

    constructor(protected request = new HTTPUtil.Request()) {}

    public async fetchPoints(
        lat: number,
        lng: number
    ): Promise<ForecastPoint[]> {
        try {
            const response = await this.request.get<StormGlassForecastResponse>(
                `${stormGlassResourceConfig.get(
                    "apiUrl"
                )}/weather/point?params=${this.stormGlassAPIParams}&source=${
                    this.stormGlassAPISource
                }&lat=${lat}&lng=${lng}`,
                {
                    headers: {
                        Authorization: stormGlassResourceConfig.get("apiToken"),
                    },
                }
            );

            return this.normalizeResponse(response.data);
        } catch (err) {
            if (err instanceof Error && HTTPUtil.Request.isRequestError(err)) {
                const axiosError = HTTPUtil.Request.extractErrorData(err);
                throw new StormGlassResponseError(
                    `Error:${JSON.stringify(axiosError.data)} Code:${
                        axiosError.status
                    }`
                );
            }

            throw new ClientRequestError(JSON.stringify(err));
        }
    }

    private normalizeResponse(
        point: StormGlassForecastResponse
    ): ForecastPoint[] {
        return point.hours
            .filter(this.isValidPoint.bind(this))
            .map((point) => ({
                time: point.time,
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource],
            }));
    }

    //O tipo Partial faz com que todas as propriedades do tipo/interface passada virem opcionais
    private isValidPoint(point: Partial<StormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }
}

export {
    StormGlass,
    StormGlassForecastResponse,
    StormGlassPoint,
    ClientRequestError,
    ForecastPoint,
};
