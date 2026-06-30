import { ExpectedError } from "./ExpectedError";

export class NotFoundError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("NotFoundError", key);
        this.statuscode = 404;
    }
}