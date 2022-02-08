import { User } from "@src/models/user";
import { AuthService } from "@src/services/auth";

describe("Users functional test", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });
    describe("When creating a new user", () => {
        it("should successfully create a new user with encrypted password", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            const response = await global.testRequest
                .post("/users")
                .send(newUser);

            expect(response.status).toBe(201);
            await expect(
                AuthService.comparePassword(
                    newUser.password,
                    response.body.password
                )
            ).resolves.toBeTruthy();
            expect(response.body).toEqual(
                expect.objectContaining({
                    ...newUser,
                    ...{ password: expect.any(String) },
                })
            );
        });

        it("should throw 422 when there is a validation error", async () => {
            const newUser = {
                email: "john@email.com",
                password: "1234",
            };

            const response = await global.testRequest
                .post("/users")
                .send(newUser);

            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                code: 422,
                error: "Unprocessable Entity",
                message:
                    "User validation failed: name: Path `name` is required.",
            });
        });

        it("should throw 409 when the email already exists", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            await global.testRequest.post("/users").send(newUser);
            const response = await global.testRequest
                .post("/users")
                .send(newUser);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                code: 409,
                error: "Conflict",
                message: `User validation failed: email: already exists in the database.`,
            });
        });
    });

    describe("When authenticate a user", () => {
        it("should generate a token for a valid user", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            await new User(newUser).save();

            const response = await global.testRequest
                .post("/users/authenticate")
                .send({ email: newUser.email, password: newUser.password });

            expect(response.body).toEqual(
                expect.objectContaining({ token: expect.any(String) })
            );
        });

        it("should return UNAUTHORIZED if the user with the given email is not found", async () => {
            const response = await global.testRequest
                .post("/users/authenticate")
                .send({
                    email: "some-email@email.com",
                    password: "1234",
                });

            expect(response.status).toBe(401);
        });

        it("should return UNAUTHORIZED if the user is found but the password doesn't match", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            await new User(newUser).save();

            const response = await global.testRequest
                .post("/users/authenticate")
                .send({ email: newUser.email, password: "different password" });

            expect(response.status).toBe(401);
        });
    });

    describe("When getting user profile info", () => {
        it("should return the token's owner profile information", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            const user = await new User(newUser).save();
            const token = AuthService.generateToken(user.toJSON());

            const { body, status } = await global.testRequest
                .get("/users/me")
                .set({ "x-access-token": token });

            expect(status).toBe(200);
            expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
        });

        it("should return Not Found, when the user is not found", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@email.com",
                password: "1234",
            };

            //Criamos uma nova instância de User, porém não a salvamos no banco de dados.
            const user = new User(newUser);
            const token = AuthService.generateToken(user.toJSON());

            const { body, status } = await global.testRequest
                .get("/users/me")
                .set({ "x-access-token": token });

            expect(status).toBe(404);
            expect(body.message).toBe("User not found!");
        });
    });
});
