import { ExpectedError } from "./ExpectedError";

export class ConflictError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("ConflictError", key);
        this.statuscode = 409;
    }
}