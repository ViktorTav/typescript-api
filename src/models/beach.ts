import mongoose, { Document, Model, Schema } from "mongoose";

enum BeachPosition {
    S = "S",
    E = "E",
    W = "W",
    N = "N",
}

interface Beach {
    _id?: string;
    name: string;
    position: BeachPosition;
    lat: number;
    lng: number;
    user: string;
}

interface BeachModel extends Omit<Beach, "_id">, Document {}

const schema = new mongoose.Schema(
    {
        lat: {
            type: Number,
            required: true,
        },
        lng: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
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

const Beach: Model<BeachModel> = mongoose.model("Beach", schema);

export { Beach, BeachPosition };
