import { Schema, Types, model } from 'mongoose';

export interface ICollect {
	user: Types.ObjectId;
	count: number;
	createdAt: Date;
}

const collectSchema = new Schema<ICollect>({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	count: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
});

export const Collect = model<ICollect>('Collect', collectSchema);
