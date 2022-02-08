import mongoose, { Document, Model } from "mongoose";
import { AuthService } from "@src/services/auth";
import logger from "@src/logger";

interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
}

enum CUSTOM_VALIDATION {
    DUPLICATED = "DUPLICATED",
}

interface UserModel extends Omit<User, "_id">, Document {}

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

/*
    Quando usamos a propriedade unique em algum campo do nosso schema (nesse caso, utilizamos
    no email), o mongoose não tem uma verificação própria para isso, então o mesmo deixa para o 
    próprio mongodb validar esse campo. O problema disso é que se há um erro de validação, o erro 
    lançado não é o mesmo do mongoose (mongoose.Error.ValidationError) e sim do mongo, então para
    resolvermos isso criamos a nossa própria validação com o mongoose que verifica se já existe 
    algum document com aquele email. Também definimos a mensagem de erro e o kind/type do erro.
*/
schema.path("email").validate(
    async (email: string) => {
        const emailCount = await mongoose.models.User.countDocuments({ email });
        return !emailCount;
    },
    "already exists in the database.",
    CUSTOM_VALIDATION.DUPLICATED
);

/*
    Para criptografarmos a senha, utilizamos o método pre do nosso schema, que nos
    permite executar alguma função antes de algum evento acontecer.
*/

schema.pre<UserModel>("save", async function (): Promise<void> {
    /*
        Para evitarmos de criptografar uma senha que foi modificada, por exemplo em algum update,
        usamos o método isModified.
    */
    if (!this.password || !this.isModified("password")) {
        return;
    }

    try {
        const hashedPassword = await AuthService.hashPassword(this.password);
        this.password = hashedPassword;
    } catch (err) {
        logger.error(`Error hashing the password for the user ${this.name}.`);
    }
});

const User: Model<UserModel> = mongoose.model("User", schema);

export { User, CUSTOM_VALIDATION };
