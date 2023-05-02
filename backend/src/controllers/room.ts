import { NextFunction, Request, Response } from "express";
import { IRoom, Room } from "../models/Room";
import { IPagination, IResult } from "../interfaces/Result";

export const getRooms = async (req: Request, res: Response<IResult<IRoom[]>>, next: NextFunction) => {
	try {
		const reqQuery = { ...req.query };
		const removeFields = ["select", "sort", "page", "limit"];
		removeFields.forEach((param) => delete reqQuery[param]);

		let queryStr = JSON.stringify(req.query);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
		let query = Room.find(JSON.parse(queryStr)).populate("booking");

		// Select field
		if (req.query.select && req.query.select instanceof String) {
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
		const total = await Room.countDocuments();

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

		const rooms = await query;

		if (!rooms || rooms.length === 0) {
			res.status(404).json({ success: false, message: "not found" });
		}
		res.status(200).json({ success: true, count: Room.length, pagination: pagination, data: rooms });
	} catch (err: any) {
		console.error(err);
		res.status(400).json({ success: false, message: err });
	}
}


export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const room = await Room.findById(req.params.id);
		if (!room) {
			return res.status(404).json({ success: false, message: "Not found" });
		}
		res.status(200).json({ success: true, data: room });
	} catch (err: any) {
		res.status(400).json({ success: false, message: err });
	}
}

export const createRoom = async (req: Request, res: Response<IResult<IRoom>>, next: NextFunction) => {
	const room = await Room.create(req.body);
	res.status(201).json({ success: true, data: room });
}

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
	console.log("req.params.id", req.params.id)
	try {
		const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!room) {
			return res.status(400).json({ success: false, data: room });
		}
		res.status(200).json({ success: true, data: room });
	} catch (err: any) {
		res.status(400).json({ success: false, message: err });
		console.error(err);
	}
}

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const room = await Room.findById(req.params.id);
		if (!room) {
			return res.status(400).json({ success: false, message: "Not found" });
		}
		room.deleteOne();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false, message: err });
	}
}