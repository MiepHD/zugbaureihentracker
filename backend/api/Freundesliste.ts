import { Request, Response } from "express";

import { Freundesliste as DBFreundesliste } from "../models/Freundesliste";

import { API } from "./API";

export class Freundesliste {
    async add(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.add(sessiontoken, data.uuid);
            res.redirect("/freunde");
        } catch (e: any) {
            res.redirect("/freunde?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async remove(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.remove(sessiontoken, data.uuid);
            res.redirect("/freunde");
        } catch (e: unknown) {
            res.redirect("/freunde?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async baureihenVonFreundenAbrufen(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            let data: any = await DBFreundesliste.baureihenVonFreundenAbrufen(sessiontoken);
            if (data && data.Freunde) data = data.Freunde;
            res.send(`${JSON.stringify(data)}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }
}