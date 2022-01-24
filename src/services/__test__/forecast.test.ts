import { StormGlass } from "@src/clients/stormGlass";
import stormGlassNormalizedResponseFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json";
import {
    Beach,
    BeachPosition,
    Forecast,
    ProcessingInternalError,
} from "../forecast";

jest.mock("@src/clients/stormGlass");

describe("Forecast service", () => {
    const mockedStormGlassService = new StormGlass() as jest.Mocked<StormGlass>;

    it("should return the forecast list of beaches", async () => {
        mockedStormGlassService.fetchPoints.mockResolvedValue(
            stormGlassNormalizedResponseFixture
        );

        const beaches: Beach[] = [
            {
                lat: -33.792726,
                lng: 151.289824,
                name: "Manly",
                position: BeachPosition.E,
                user: "some-id",
            },
        ];

        const expectedResponse = [
            {
                time: "2020-04-26T00:00:00+00:00",
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: "Manly",
                        position: "E",
                        rating: 1,
                        swellDirection: 64.26,
                        swellHeight: 0.15,
                        swellPeriod: 3.89,
                        waveDirection: 231.38,
                        waveHeight: 0.47,
                        windDirection: 299.45,
                        windSpeed: 100,
                        time: "2020-04-26T00:00:00+00:00",
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
                        rating: 1,
                        swellDirection: 123.41,
                        swellHeight: 0.21,
                        swellPeriod: 3.67,
                        waveDirection: 232.12,
                        waveHeight: 0.46,
                        windDirection: 310.48,
                        windSpeed: 100,
                        time: "2020-04-26T01:00:00+00:00",
                    },
                ],
            },
            {
                time: "2020-04-26T02:00:00+00:00",
                forecast: [
                    {
                        lat: -33.792726,
                        lng: 151.289824,
                        name: "Manly",
                        position: "E",
                        rating: 1,
                        swellDirection: 182.56,
                        swellHeight: 0.28,
                        swellPeriod: 3.44,
                        waveDirection: 232.86,
                        waveHeight: 0.46,
                        windDirection: 321.5,
                        windSpeed: 100,
                        time: "2020-04-26T02:00:00+00:00",
                    },
                ],
            },
        ];

        const forecast = new Forecast(mockedStormGlassService);
        const beachsWithRating = await forecast.processForecastForBeaches(
            beaches
        );

        expect(beachsWithRating).toEqual(expectedResponse);
    });

    it("should return a empty list when the beaches array is empty", async () => {
        const forecast = new Forecast();
        await expect(forecast.processForecastForBeaches([])).resolves.toEqual(
            []
        );
    });

    it("should return internal processing error when something goes wrong during the rating process", async () => {
        const beaches: Beach[] = [
            {
                lat: -33.792726,
                lng: 151.289824,
                name: "Manly",
                position: BeachPosition.E,
                user: "some-id",
            },
        ];

        mockedStormGlassService.fetchPoints.mockRejectedValue(
            "Error fetching data"
        );

        const forecast = new Forecast(mockedStormGlassService);

        await expect(
            forecast.processForecastForBeaches(beaches)
        ).rejects.toThrow(ProcessingInternalError);
    });
});
