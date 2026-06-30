import { ExpectedError } from "./ExpectedError";

export class InternalError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("InternakError", key);
        this.statuscode = 500;
    }
}