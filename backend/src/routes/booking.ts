import express from 'express';

import { protect, authorize } from "../middleware/auth";
import { createBooking, deleteBooking, getBooking, getBookings, updateBooking } from '../controllers/booking';

const bookingRouter = express.Router({ mergeParams: true });


bookingRouter.route("/").get(protect, getBookings).post(protect, authorize(["admin", "user"]), createBooking);
bookingRouter.route("/:id").get(protect, getBooking).put(protect, authorize(["admin", "user"]), updateBooking)
	.delete(protect, authorize(["admin", "user"]), deleteBooking);

export { bookingRouter }