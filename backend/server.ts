import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './src/config/db';
import cookieParser from 'cookie-parser';
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
const xss = require("xss-clean");
import hpp from 'hpp';
import rateLimit from "express-rate-limit";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { authRouter } from './src/routes/auth';
import { workingSpaceRouter } from './src/routes/workingSpace';
import { bookingRouter } from './src/routes/booking';

dotenv.config({ path: "./src/config/config.env" });

connectDb();

const app = express();
app.use(cors());

const version = "/v1";
const baseUrl = "/api" + version;

const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());
app.use(hpp());
app.use(helmet());
app.use(xss());
const swaggerOptions = {
	swaggerDefinition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Co-Working Space Reservation API",
		},
		servers: [
			{
				url: "http://localhost:3000/api/v1",
			},
		],
	},
	apis: ["./routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(`${baseUrl}/auth`, authRouter);
app.use(`${baseUrl}/workingSpace`, workingSpaceRouter);
app.use(`${baseUrl}/bookings`, bookingRouter);

const PORT: number = Number(process.env.PORT ?? '5000');

const server = app.listen(PORT, () => console.log("Server running in ", process.env.NODE_ENV, " node on port", PORT));