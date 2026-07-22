import { Request, Response } from "express";

import { Sessiontoken as DBSessiontoken } from "../models/Sessiontoken";

export class Sessiontoken {
    async logout(req: Request, res: Response) {
        await DBSessiontoken.remove(req.cookies.sessiontoken);
        res.clearCookie("sessiontoken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        const data: any = req.query;
        if (data.errorMessage) {
            res.redirect("/public/login?errorMessage=" + encodeURIComponent(data.errorMessage));
        } else {
            res.redirect("/public/login");
        }
    }
}