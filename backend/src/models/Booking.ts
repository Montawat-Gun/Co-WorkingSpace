import { Schema, Types, model } from 'mongoose';

export interface IBooking {
	bookingDate: Date;
	user: Types.ObjectId;
	room: Types.ObjectId;
	createAt: Date;
}

const bookingSchema = new Schema<IBooking>({
	bookingDate: { type: Date, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
	createAt: { type: Date, default: Date.now },
});

export const Booking = model<IBooking>('Booking', bookingSchema);