import { StormGlass } from "@src/clients/stormGlass";
import axios from "axios";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json";
import stormGlassNormalized3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json";
import dotenv from "dotenv";

dotenv.config();

jest.mock("axios");

describe("StormGlass client", () => {
    /*
        Para que tenhamos os tipos tanto do axios, quanto do jest, criamos um mockedAxios 
        que recebe o próprio axios, porém trocamos o seu tipo para Mocked, que contém um generics
        que definimos com o tipo do axios.

        Dessa maneira, também não precisamos reescrevermos os métodos do axios.

        Exemplo sem Mocked: axios.get = jest.fn().mockResolvedValue();

    */
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    it("should return the normalized forecast front the StormGlass service", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockResolvedValue({
            data: stormGlassWeather3HoursFixture,
        });

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormGlassNormalized3HoursFixture);
    });

    it("should exclude incomplete data points", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300,
                    },
                    time: "2022-01-22T00:00:00+00:00",
                },
            ],
        };

        mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

        const stormGlass = new StormGlass(mockedAxios);
        const response = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual([]);
    });

    it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockRejectedValue("Network Error");

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            `Unexpected error when to trying to communicate to StormGlass: "Network Error"`
        );
    });

    it("should get a StormGlassResponseError when the StormGlass service responds with error", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedAxios.get.mockRejectedValue({
            response: {
                data: {
                    errors: ["Rate limit reached"],
                },
                status: 429,
            },
        });

        const stormGlass = new StormGlass(mockedAxios);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            `Unexpected error returned by to StormGlass service: Error:{"errors":["Rate limit reached"]} Code:429`
        );
    });
});
