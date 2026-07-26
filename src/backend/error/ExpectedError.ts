import { readFileSync } from "fs";
import path from "path";

export abstract class ExpectedError extends Error {
    abstract statuscode: number;
    private static errorMessages: any = JSON.parse(readFileSync(path.join(__dirname, 'errorMessages.json'), 'utf8'));
    constructor(errorType: string, key: string) {
        super(ExpectedError.errorMessages[`${errorType}.${key}`]);
    }

    replace(before: string, after: string): ExpectedError {
        this.message = this.message.replace(before, after);
        return this;
    }
}