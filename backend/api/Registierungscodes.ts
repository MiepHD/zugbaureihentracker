import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Registrierungscodes as DBRegistrierungscodes } from "../models/Registrierungscodes";

import { API } from "./API";

export class Registrierungscodes {
    async add(req: Request, res: Response, isAuthenticated: boolean) {
        const data = req.body;
        if (!isAuthenticated) {
            const sessiontoken = await API.checkSessiontoken(req, res);
            if (sessiontoken == null) return;
            if (!await DBNutzer.isElevated(sessiontoken)) {res.status(401); res.send(); return; }
        }
        
        const success = await DBRegistrierungscodes.add(data.code as string);
        if (success) {
            res.redirect("/invite");
        } else {
            res.send("Error");
        }
    }
}