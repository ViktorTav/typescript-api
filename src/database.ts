import config, { IConfig } from "config";
import mongoose, { Mongoose } from "mongoose";

const dbConfig: IConfig = config.get("App.database");

const connect = async (): Promise<Mongoose> =>
    await mongoose.connect(dbConfig.get("mongoUrl"));

const close = (): Promise<void> => mongoose.connection.close();

export { connect, close };
