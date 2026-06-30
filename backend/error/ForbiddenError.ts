import { ExpectedError } from "./ExpectedError";

export class ForbiddenError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("ForbiddenError", key);
        this.statuscode = 403;
    }
}