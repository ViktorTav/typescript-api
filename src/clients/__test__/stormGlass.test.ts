import { StormGlass } from "@src/clients/stormGlass";
import stormGlassWeather3HoursFixture from "@test/fixtures/stormglass_weather_3_hours.json";
import stormGlassNormalized3HoursFixture from "@test/fixtures/stormglass_normalized_response_3_hours.json";
import * as HTTPUtil from "@src/util/request";

jest.mock("@src/util/request");

describe("StormGlass client", () => {
    /*
        Para que tenhamos os tipos tanto do HTTPUtil.Request, quanto do jest, criamos um mockedRequest 
        que recebe uma instância do HTTPUtil.Request, porém trocamos o seu tipo para Mocked, que contém um generics
        onde definimos com o tipo do próprio Request.

        Dessa maneira, também não precisamos reescrever os métodos de Request.

        Exemplo sem Mocked: request.get = jest.fn().mockResolvedValue();
        Exemplo com Mocked: mockedRequest.get.mockResolvedValue();
    */

    const mockedRequest =
        new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

    /*
        Agora para mockarmos o métodos estáticos de uma classe, ao invés de passar como tipo o HTTPUtil.Request,
        que seria o tipo da instãncia, passamos o type of HTTPUtil.Request, que seria a própria classe.
    */

    const MockedRequestClass = HTTPUtil.Request as jest.Mocked<
        typeof HTTPUtil.Request
    >;

    it("should return the normalized forecast front the StormGlass service", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedRequest.get.mockResolvedValue({
            data: stormGlassWeather3HoursFixture,
        } as HTTPUtil.Response);

        const stormGlass = new StormGlass(mockedRequest);
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

        mockedRequest.get.mockResolvedValue({
            data: incompleteResponse,
        } as HTTPUtil.Response);

        const stormGlass = new StormGlass(mockedRequest);
        const response = await stormGlass.fetchPoints(lat, lng);

        expect(response).toEqual([]);
    });

    it("should get a generic error from StormGlass service when the request fail before reaching the service", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        mockedRequest.get.mockRejectedValue("Network Error");

        const stormGlass = new StormGlass(mockedRequest);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            `Unexpected error when to trying to communicate to StormGlass: "Network Error"`
        );
    });

    it("should get a StormGlassResponseError when the StormGlass service responds with error", async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        class FakeAxiosError extends Error {
            constructor(public response: object) {
                super();
            }
        }

        mockedRequest.get.mockRejectedValue(
            new FakeAxiosError({
                data: {
                    errors: ["Rate limit reached"],
                },
                status: 429,
            })
        );

        MockedRequestClass.isRequestError.mockReturnValue(true);

        MockedRequestClass.extractErrorData.mockReturnValue({
            data: {
                errors: ["Rate limit reached"],
            },
            status: 429,
        });

        const stormGlass = new StormGlass(mockedRequest);

        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
            `Unexpected error returned by to StormGlass service: Error:{"errors":["Rate limit reached"]} Code:429`
        );
    });
});
