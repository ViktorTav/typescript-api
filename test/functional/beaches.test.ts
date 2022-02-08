import { Beach } from "@src/models/beach";
import { User } from "@src/models/user";
import { AuthService } from "@src/services/auth";

describe("Beaches functional tests", () => {
    const defaultUser = {
        name: "John Doe",
        email: "john@email.com",
        password: "1234",
    };
    let token: string;
    beforeEach(async () => {
        await Beach.deleteMany({});
        await User.deleteMany({});
        const user = await new User(defaultUser).save();
        //É necessário utilizar o método toJSON para passarmos somente as informações do usuário
        token = AuthService.generateToken(user.toJSON());
    });
    describe("When creating a beach", () => {
        it("should create a beach with success", async () => {
            const newBeach = {
                lat: -33.792726,
                lng: 151.289824,
                name: "Manly",
                position: "E",
            };

            const response = await global.testRequest
                .post("/beaches")
                .set({
                    "x-access-token": token,
                })
                .send(newBeach);

            expect(response.status).toBe(201);
            /*
                Ao criarmos uma nova praia, api retornará as mesmas informações que enviamos da praia  
                e o id da mesma, porém isso nos impede de utilizar o toEqual normalmente por conta que não 
                sabemos esse id. Então aqui utilizamos o método objectContaining do jest, dentro do toEqual,
                que nos permite esperar que a resposta da api seja um objeto que contenha as propriedades de
                newBeach. 
            */
            expect(response.body).toEqual(expect.objectContaining(newBeach));
        });

        it("should return a 422 when there is a validation error", async () => {
            const newBeach = {
                lat: "invalid_string",
                lng: 151.289824,
                name: "Manly",
                position: "E",
            };

            const response = await global.testRequest
                .post("/beaches")
                .set({
                    "x-access-token": token,
                })
                .send(newBeach);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: "Unprocessable Entity",
                message: `Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"`,
            });
        });
    });
});
