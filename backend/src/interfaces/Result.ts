export interface IResult<T> {
	success: boolean;
	data?: T;
	message?: string;
	count?: number;
	pagination?: IPagination;
}

export interface IPagination {
	next?: {
		page: number;
		limit: number;
	}
	prev?: {
		page: number;
		limit: number;
	}
}