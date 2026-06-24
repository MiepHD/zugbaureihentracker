import { Request, Response } from "express";

import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";

import { API } from "./API";

export class Aktivitaet {
    /**
     * Lia
     * Gibt die Request, eine Baureihe als gefunden zu markieren an die Datenbank weiter und je nach Anwort Redirected entweder auf die Home Seite oder auf die Suchergebnis Seite.
     */
    async alsGefundenMarkieren(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        if(await DBAktivitaet.alsGefundenMarkieren(sessiontoken, data.ubid)) {
            res.redirect("/home");
        } else {
            res.redirect(`/suchergebnis?ubid=${data.ubid}`);
        }
    }

    async getGefundene(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        res.send(`${JSON.stringify(await DBAktivitaet.getGefundeneBaureihen(sessiontoken))}`);
    }
}