import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Registrierungscodes as DBRegistrierungscodes } from "../models/Registrierungscodes";

import { API } from "./API";

import { ForbiddenError } from "../error/ForbiddenError";

export class Registrierungscodes {
    async add(req: Request, res: Response, isAuthenticated: boolean) {
        await API.try(req, res, false, "invite?", async (data, ignored) => {
            if (!isAuthenticated) {
                const sessiontoken = await API.checkSessiontoken(req, res);
                if (sessiontoken == null) return;
                if (!await DBNutzer.isElevated(sessiontoken)) throw new ForbiddenError("createCode");
            }
            await DBRegistrierungscodes.add(data.code as string);
            res.redirect("/invite?successMessage=" + encodeURIComponent("Registrierungscode erfolgreich erstellt."));
        });
    }
}