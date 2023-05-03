import { NextFunction, Request, Response } from "express";
import { IWorkingSpace, WorkingSpace } from "../models/WorkingSpace";
import { IPagination, IResult } from "../interfaces/Result";

export const getWorkingSpaces = async (req: Request, res: Response<IResult<IWorkingSpace[]>>, next: NextFunction) => {
	try {
		const reqQuery = { ...req.query };
		const removeFields = ["select", "sort", "page", "limit"];
		removeFields.forEach((param) => delete reqQuery[param]);

		let queryStr = JSON.stringify(req.query);
		queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
		let query = WorkingSpace.find(JSON.parse(queryStr)).populate("booking");

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

		const workingSpaces = await query;

		if (!workingSpaces || workingSpaces.length === 0) {
			res.status(404).json({ success: false, message: "not found" });
		}
		res.status(200).json({ success: true, count: total, pagination: pagination, data: workingSpaces });
	} catch (err: any) {
		console.error(err);
		res.status(400).json({ success: false, message: err });
	}
}


export const getWorkingSpace = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const workingSpace = await WorkingSpace.findById(req.params.id);
		if (!workingSpace) {
			return res.status(404).json({ success: false, message: "Not found" });
		}
		res.status(200).json({ success: true, data: workingSpace });
	} catch (err: any) {
		res.status(400).json({ success: false, message: err });
	}
}

export const createWorkingSpace = async (req: Request, res: Response<IResult<IWorkingSpace>>, next: NextFunction) => {
	const workingSpace = await WorkingSpace.create(req.body);
	res.status(201).json({ success: true, data: workingSpace });
}

export const updateWorkingSpace = async (req: Request, res: Response, next: NextFunction) => {
	console.log("req.params.id", req.params.id)
	try {
		const workingSpace = await WorkingSpace.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!workingSpace) {
			return res.status(400).json({ success: false, data: workingSpace });
		}
		res.status(200).json({ success: true, data: workingSpace });
	} catch (err: any) {
		res.status(400).json({ success: false, message: err });
		console.error(err);
	}
}

export const deleteWorkingSpace = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const workingSpace = await WorkingSpace.findById(req.params.id);
		if (!workingSpace) {
			return res.status(400).json({ success: false, message: "Not found" });
		}
		workingSpace.deleteOne();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false, message: err });
	}
}