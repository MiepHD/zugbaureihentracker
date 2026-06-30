import { ExpectedError } from "./ExpectedError";

export class UnauthorizedError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("UnauthorizedError", key);
        this.statuscode = 401;
    }
}