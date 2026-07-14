import { ExpectedError } from "./ExpectedError";

export class UnauthorizedError extends ExpectedError {
    statuscode: number;
    redirect: boolean;
    constructor(key: string, redirect: boolean = true) {
        super("UnauthorizedError", key);
        this.statuscode = 401;
        this.redirect = redirect;
    }
}