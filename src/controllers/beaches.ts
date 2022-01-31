import { ClassMiddleware, Controller, Post } from "@overnightjs/core";
import { authMiddleware } from "@src/middlewares/auth";
import { Beach } from "@src/models/beach";
import { Request, Response } from "express";
import mongoose from "mongoose";

@Controller("beaches")
@ClassMiddleware(authMiddleware)
class BeachesController {
    @Post("")
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const beach = new Beach({
                ...req.body,
                ...{ user: req.decoded?.id },
            });
            const result = await beach.save();
            /* 
                Quando passamos um objeto para o método send do express, o mesmo irá chamar o 
                JSON.stringify para fazer a conversão para string, porém caso o objeto 
                tenha um método toJSON, o método stringify chama esse método que se torna a responsável
                por essa conversão, ou seja, o método toJSON do mongoose.Schema que alteramos
                na criação do model Beach, é chamado aqui.
    
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#:~:text=If%20the%20value%20has%20a%20toJSON()%20method%2C%20it%27s%20responsible%20to%20define%20what%20data%20will%20be%20serialized.            
            */
            res.status(201).send(result);
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                res.status(422).send({ error: err.message });
            } else {
                res.status(500).send({ error: "Internal server error" });
            }
        }
    }
}

export { BeachesController };
