import express from 'express';
import { createRoom, deleteRoom, getRoom, getRooms, updateRoom } from '../controllers/room';
import { protect, authorize } from "../middleware/auth";
import { bookingRouter } from './booking';

const roomRouter = express.Router();

roomRouter.use('/:roomId/booking/', bookingRouter);

roomRouter.route("/").get(protect, getRooms).post(protect, authorize(["admin"]), createRoom);

roomRouter.route("/:id").get(protect, getRoom).put(protect, authorize(["admin"]), updateRoom).delete(protect, authorize(["admin"]), deleteRoom);

export { roomRouter }