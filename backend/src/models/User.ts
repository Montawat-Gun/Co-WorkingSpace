import { Model, Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser {
	id: string;
	name: string;
	email: string;
	phone: string;
	password: string;
	createdAt: Date;
	role: "user" | "admin",
	resetPasswordToken: string,
	resetPasswordExpire: Date,
	balance: number
}

interface IUserMethods {
	getSignedJwtToken(): string;
	matchPassword(enteredPassword: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser>({
	name: { type: String, required: [true, "Please add a name"] },
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Please add a valid email",
		],
	},
	phone: {
		type: String,
		required: [true, "Please add a phone"],
		maxlength: 10,
		match: [
			/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
			"Please add a valid phone number"
		]
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: 6,
		select: false,
	},
	balance: { type: Number, required: true },
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

userSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.getSignedJwtToken = function () {
	const JWT_EXPIRE: string = process.env.JWT_EXPIRE!;
	const JWT_SECRET: string = process.env.JWT_SECRET!;

	return jwt.sign({ id: this._id }, JWT_SECRET!, {
		expiresIn: JWT_EXPIRE!,
	});
};

userSchema.methods.matchPassword = async function (enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = model<IUser, UserModel>('User', userSchema);

export { User };