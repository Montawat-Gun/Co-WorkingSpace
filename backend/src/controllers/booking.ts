import { NextFunction, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { IRoom, Room } from "../models/Room";
import { Collect } from "../models/Collect";

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
	let query;
	if (req.body.user.role !== "admin") {
		query = Booking.find({ user: req.body.user.id }).populate({
			path: "room",
		});
	} else {
		query = Booking.find().populate({
			path: "room",
		});
	}
	try {
		const booking = await query;

		res.status(200).json({ success: true, count: booking.length, data: booking });
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: "Cannot find booking" });
	}
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const booking = await Booking.findById(req.params.id).populate({
			path: "room",
		});

		if (!booking) {
			return res.status(404).json({ success: true, message: "No booking with the id of " + req.params.id });
		}

		res.status(200).json({
			success: true,
			data: booking,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: "Cannot find Booking" });
	}
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
	try {
		req.body.room = req.params.roomId;
		const room = await Room.findById(req.params.roomId);
		if (!room) {
			return res.status(404).json({ success: false, message: `No room with the id of ${req.params.roomId}` });
		}
		//add user Id to req.body
		req.body.user = req.body.user.id;
		//Check for existed appointment
		const existedBookings = await Booking.find({ user: req.body.user.id });
		//If the user is not an admin, they can only create 3 appointment.
		if (existedBookings.length >= 3 && req.body.user.role !== "admin") {
			return res.status(400).json({ success: false, message: `The user with ID ${req.body.user.id} has already made 3 booking` });
		}
		const booking = await Booking.create(req.body);
		const collect = await Collect.findOne({ user: req.body.user });
		console.log(collect);
		if (collect) {
			await Collect.findOneAndUpdate(collect._id, { count: collect.count + 1 }, {
				new: true,
				runValidators: true,
			});
		} else {
			await Collect.create({ user: req.body.user, count: 1 })
		}
		res.status(201).json({
			success: true,
			data: booking,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: "Cannot create Booking" });
	}
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
		}
		//Make sure user is the appointment owner
		if (booking.user.toString() !== req.body.user.id && req.body.user.role !== "admin") {
			return res.status(401).json({ success: false, message: `User ${req.body.user.id} is not authorized to update this booking` });
		}
		booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		res.status(200).json({
			success: true,
			data: booking,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: "Cannot update Booking" });
	}
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
		}
		//Make sure user is the appointment owner
		if (booking.user.toString() !== req.body.user.id && req.body.user.role !== "admin") {
			return res.status(401).json({ success: false, message: `User ${req.body.user.id} is not authorized to delete this booking` });
		}
		await booking.deleteOne();
		res.status(200).json({
			success: true,
			data: {},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: "Cannot delete Booking" });
	}
}