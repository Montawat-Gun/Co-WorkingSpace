import express from 'express';
import { createWorkingSpace, deleteWorkingSpace, getWorkingSpace, getWorkingSpaces, updateWorkingSpace } from '../controllers/workingSpace';
import { protect, authorize } from "../middleware/auth";
import { bookingRouter } from './booking';

const workingSpaceRouter = express.Router();

workingSpaceRouter.use('/:workingSpaceId/booking/', bookingRouter);

workingSpaceRouter.route("/").get(protect, getWorkingSpaces).post(protect, authorize(["admin"]), createWorkingSpace);

workingSpaceRouter.route("/:id").get(protect, getWorkingSpace).put(protect, authorize(["admin"]), updateWorkingSpace).delete(protect, authorize(["admin"]), deleteWorkingSpace);

export { workingSpaceRouter }