import { Request, Response } from "express";

import { Baureihe as DBBaureihe } from "../models/Baureihe";
import { Nutzer as DBNutzer } from "../models/Nutzer";

import { API } from "./API";

export class Baureihe {
    /**
     * Lia
     * Gibt die Request die Information zu einer Baureihe zu bekommen an die Datenbank weiter
     */
    async get(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.query;
        try {
            if (data.ubid == null || typeof data.ubid != "string" || data.ubid == "") throw new Error("UBID fehlerhaft.")
            res.send(`${JSON.stringify(await DBBaureihe.get(data.ubid))}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
        
    }

    async count(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        res.send(`${await DBBaureihe.getCount()}`);
    }

    async add(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        if (!await DBNutzer.isElevated(sessiontoken)) {res.status(401); res.send(); return; }
        const data = req.body;
        try {
            if (data.ubid == null || typeof data.ubid != "string" || data.ubid == "") throw new Error("UBID fehlerhaft.");
            if (data.name == null || typeof data.name != "string" || data.name == "") throw new Error("Name fehlerhaft.");
            if (data.beschreibung == null || typeof data.beschreibung != "string" || data.beschreibung == "") throw new Error("Beschreibung fehlerhaft.");
            
            await DBBaureihe.add(data.ubid, data.name, data.beschreibung);
            res.redirect("/add");
        } catch (e: unknown) {
            res.redirect("/add?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }
}