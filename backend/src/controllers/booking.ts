import { NextFunction, Request, Response } from "express";
import { Booking } from "../models/Booking";
import { WorkingSpace } from "../models/WorkingSpace";
import { Collect } from "../models/Collect";
import { User } from "../models/User";
import { IPagination } from "../interfaces/Result";

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
	const reqQuery = { ...req.query };
	const removeFields = ["select", "sort", "page", "limit"];
	removeFields.forEach((param) => delete reqQuery[param]);

	let queryStr = JSON.stringify(req.query);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
	let query = Booking.find(JSON.parse(queryStr)).populate("user");

	// Select field
	if (req.query.select && typeof req.query.select === "string") {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	// Sort
	if (req.query.sort && req.query.sort instanceof String) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// Pagination
	const page = parseInt(req.query.page?.toString() ?? '', 10) ?? 1;
	const limit = parseInt(req.query.limit?.toString() ?? '', 10) ?? 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await WorkingSpace.countDocuments();

	// Execute query
	query = query.skip(startIndex).limit(limit);

	// Pagination result
	const pagination: IPagination = {};

	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit: limit,
		};
	}

	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit: limit,
		};
	}


	if (req.body.user.role !== "admin") {
		query = query.where({ user: req.body.user.id });
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
			path: "workingSpace",
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
		req.body.workingSpace = req.params.workingSpaceId;
		const workingSpace = await WorkingSpace.findById(req.params.workingSpaceId);
		if (!workingSpace) {
			return res.status(404).json({ success: false, message: `No workingSpace with the id of ${req.params.workingSpaceId}` });
		}

		const bookingDate = new Date(req.body.bookingDate);
		const nextDate = new Date(req.body.bookingDate);
		nextDate.setDate(bookingDate.getDate() + 1);

		// Check for this time is already reserved
		const workingSpaceBooking = await Booking.find({ status: "reserved", bookingDate: { $gte: bookingDate, $lt: nextDate }, workingSpace: workingSpace.id });
		if (workingSpaceBooking.length > 0) {
			return res.status(400).json({ success: false, message: `This workspace has been reserved in this time` });
		}

		// Check for existed booking
		const existedBookings = await Booking.find({ user: req.body.user.id, status: "reserved", bookingDate: { $gt: new Date() } });
		// If the user is not an admin, they can only create 3 booking.
		if (existedBookings.length >= 3 && req.body.user.role !== "admin") {
			return res.status(400).json({ success: false, message: `The user with ID ${req.body.user.id} has already made 3 booking` });
		}

		const user = await User.findById(req.body.user.id);
		if (user && user.balance >= workingSpace.price) {
			// Update user balance after booking.
			User.findByIdAndUpdate(req.body.user.id, { balance: user.balance - workingSpace.price }, {
				new: true,
				runValidators: true,
			});

			req.body.status = "reserved";
			const booking = await Booking.create(req.body);

			// Collect point after booking
			const collect = await Collect.findOne({ user: req.body.user });
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
		} else {
			res.status(400).json({
				success: false,
				message: "Your balance is not enough."
			});
		}
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