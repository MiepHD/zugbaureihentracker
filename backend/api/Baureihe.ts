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
        res.send(`${JSON.stringify(await DBBaureihe.get(data.ubid as string))}`);
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
        const success = await DBBaureihe.add(data.ubid, data.name, data.beschreibung);
        if (success == true) {
            res.redirect("/add");
        } else {
            res.send(`{ "success": ${success}}`);
        }
    }
}