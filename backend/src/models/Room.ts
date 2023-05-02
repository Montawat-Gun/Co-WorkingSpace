import { Schema, model } from 'mongoose';

export interface IRoom {
	name: string;
	address: string;
	telephone: string;
	open: string;
	close: string;
	createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
	name: { type: String, required: [true, "Please add a name"], unique: true, },
	address: { type: String },
	telephone: {
		type: String,
		required: [true, "Please add a phone"],
		maxlength: 10,
		match: [
			/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
			"Please add a valid phone number"
		]
	},
	open: { type: String, required: [true, "Please add a open time"], },
	close: { type: String, required: [true, "Please add a close time"], },
	createdAt: {
		type: Date,
		default: Date.now,
	}
},
	{
		toJSON: { virtuals: true }, toObject: { virtuals: true }
	}
);

roomSchema.virtual("booking", {
	ref: "Booking",
	localField: "_id",
	foreignField: "room",
	justOne: false,
});

export const Room = model<IRoom>('Room', roomSchema);