import { ExpectedError } from "./ExpectedError";

export class ValidationError extends ExpectedError {
    statuscode: number;
    constructor(key: string) {
        super("ValidationError", key);
        this.statuscode = 400;
    }
}