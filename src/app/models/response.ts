export class Response {
	code?: number;
	data?: any;
	message?: string;
	status: boolean;
	error?: boolean;
	extra?: any;

	constructor(options: {
		code?: number;
		data?: any;
		message?: string;
		status: boolean;
		error?: boolean;
		extra?: any;
	}) {
		this.code = options.code || 0;
		this.data = options.data || null;
		this.message = options.message || '';
		this.status = options.status || true;
		this.error = options.error || false;
		this.extra = options.extra || null;
	}
}
