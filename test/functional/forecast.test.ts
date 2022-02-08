import { Beach, GeoPosition } from "@src/models/beach";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json";
import apiForecastResponseOneBeach from "@test/fixtures/api_forecast_response_one_beach.json";
/*
    A biblioteca nock nos permite interceptar requisições http feitas pela aplicação
    e alterá-las.
*/
import nock from "nock";
import { User } from "@src/models/user";
import { AuthService } from "@src/services/auth";

describe("Beach forecast functional tests", () => {
    const defaultBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: "Manly",
        position: GeoPosition.E,
    };

    const defaultUser = {
        name: "John doe",
        email: "john@email.com",
        password: "1234",
    };

    let token: string;

    beforeEach(async () => {
        await Beach.deleteMany({});
        await User.deleteMany({});

        const user = await new User(defaultUser).save();

        const defaultBeach = {
            lat: -33.792726,
            lng: 151.289824,
            name: "Manly",
            position: GeoPosition.E,
            user: user.id,
        };

        const beach = new Beach(defaultBeach);
        await beach.save();

        token = AuthService.generateToken(user.toJSON());
    });
    it("Should return a forecast with just a few times", async () => {
        nock("https://api.stormglass.io:443", {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: (): boolean => true,
            },
        })
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .get("/v2/weather/point")
            .query({
                lat: -33.792726,
                lng: 151.289824,
                params: /(.*)/,
                source: "noaa",
            })
            .reply(200, stormGlassWeather3HoursFixture);

        const { body, status } = await global.testRequest
            .get("/forecast")
            .set({ "x-access-token": token });

        expect(status).toBe(200);
        expect(body).toEqual(apiForecastResponseOneBeach);
    });

    it("should return 500 if something goes wrong during the processing", async () => {
        nock("https://api.stormglass.io:443", {
            encodedQueryParams: true,
            reqheaders: {
                Authorization: (): boolean => true,
            },
        })
            .defaultReplyHeaders({ "access-control-allow-origin": "*" })
            .get("/v2/weather/point")
            .query({
                params: "swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed",
                source: "noaa",
                lat: "-33.792726",
                lng: "151.289824",
            })
            .replyWithError("Something went error");

        const { status } = await global.testRequest
            .get("/forecast")
            .set({ "x-access-token": token });

        expect(status).toBe(500);
    });
});
