import { Request, Response } from "express";

import { Sessiontoken as DBSessiontoken } from "../models/Sessiontoken";
import { API } from "../API";

export class Sessiontoken {
    async logout(req: Request, res: Response, all: boolean) {
        API.try(req, res, true, async (data, sessiontoken) => {
            res.clearCookie("sessiontoken", {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            all ? await DBSessiontoken.removeAll(sessiontoken as string) : await DBSessiontoken.remove(sessiontoken as string);
            if (data.errorMessage) {
                res.redirect("/public/login?errorMessage=" + encodeURIComponent(data.errorMessage));
            } else {
                res.redirect("/public/login");
            }
        });
    }
}