import { Schema, Types, model } from 'mongoose';

export interface IBooking {
	bookingDate: Date;
	user: Types.ObjectId;
	workingSpace: Types.ObjectId;
	createAt: Date;
	status: "reserved" | "checkedIn" | "canceled";
	paymentStatus: "paid" | "unpaid";
	paymentType: "cash" | "coupon";
	cost: number;
}

const bookingSchema = new Schema<IBooking>({
	bookingDate: { type: Date, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	workingSpace: { type: Schema.Types.ObjectId, ref: "WorkingSpace", required: true },
	status: { type: String, required: true },
	paymentStatus: { type: String },
	paymentType: { type: String },
	cost: { type: Number },
	createAt: { type: Date, default: Date.now },
});

export const Booking = model<IBooking>('Booking', bookingSchema);