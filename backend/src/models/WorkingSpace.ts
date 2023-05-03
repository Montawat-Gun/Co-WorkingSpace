import { Schema, model } from 'mongoose';

export interface IWorkingSpace {
	name: string;
	address: string;
	telephone: string;
	openWeekDay: {
		monday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		tuesday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		wednesday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		thursday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		friday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		saturday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
		sunday: {
			isCloseAllDay: boolean;
			open: {
				hour: number;
				minute: number;
			},
			close: {
				hour: number;
				minute: number;
			}
		},
	},
	price: number;
	createdAt: Date;
}

const workingSpaceSchema = new Schema<IWorkingSpace>({
	name: { type: String, required: [true, "Please add a name"], unique: true, },
	address: { type: String },
	telephone: {
		type: String,
		required: [true, "Please add a phone"],
		maxlength: 10,
		match: [
			/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/,
			"Please add a valid phone number"
		]
	},
	openWeekDay: {
		monday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		tuesday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		wednesday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		thursday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		friday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		saturday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
		sunday: { open: { hour: { type: Number }, minute: { type: Number } }, close: { hour: { type: Number }, minute: { type: Number } }, isCloseAllDay: { type: Boolean } },
	},
	price: { type: Number, required: true },
	createdAt: {
		type: Date,
		default: Date.now,
	}
},
	{
		toJSON: { virtuals: true }, toObject: { virtuals: true }
	}
);

workingSpaceSchema.virtual("booking", {
	ref: "Booking",
	localField: "_id",
	foreignField: "workingSpace",
	justOne: false,
});

export const WorkingSpace = model<IWorkingSpace>('WorkingSpace', workingSpaceSchema);