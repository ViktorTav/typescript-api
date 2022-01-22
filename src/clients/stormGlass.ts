import { InternalError } from "@src/util/errors/internalError";
import { AxiosError, AxiosStatic } from "axios";
import config, { IConfig } from "config";

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

class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage = `Unexpected error when to trying to communicate to StormGlass`;
        super(`${internalMessage}: ${message}`);
    }
}

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

    constructor(protected request: AxiosStatic) {}

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
    private isValidPoint(point: Partial<StormGlassPoint>): Boolean {
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

    public async fetchPoints(
        lat: number,
        lng: number
    ): Promise<ForecastPoint[]> {
        /*
            Passamos a interface StormGlassForecastResponse para o generics do axios.get, para
            que o tipo do retorno do método seja StormGlassForecastResponse.
        */
        try {
            const response = await this.request.get<StormGlassForecastResponse>(
                `${stormGlassResourceConfig.get("apiUrl")}/weather/point?
                    params=${this.stormGlassAPIParams}
                    &source=${this.stormGlassAPISource}
                    &lat=${lat}&lng=${lng}`,
                {
                    headers: {
                        Authorization: stormGlassResourceConfig.get("apiToken"),
                    },
                }
            );

            return this.normalizeResponse(response.data);
        } catch (err) {
            const axiosError = err as AxiosError;
            /*
                O operador ?. serve para testar propriedades opcionais, ou seja, o mesmo nos permite
                verificar se uma propriedade existe ou não dentro de um objeto.

                Exemplo:

                if (axiosError?.response?.status){}
                ==
                if(axiosError && axiosError.response && axiosError.response.status)

            */
            if (axiosError?.response?.status) {
                throw new StormGlassResponseError(
                    `Error:${JSON.stringify(axiosError.response.data)} Code:${
                        axiosError.response.status
                    }`
                );
            }

            throw new ClientRequestError(JSON.stringify(err));
        }
    }
}

export {
    StormGlass,
    StormGlassForecastResponse,
    StormGlassPoint,
    ClientRequestError,
};
