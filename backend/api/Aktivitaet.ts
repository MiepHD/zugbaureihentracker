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
        try {
            await DBAktivitaet.alsGefundenMarkieren(sessiontoken, data.ubid);
            res.redirect("/home");
        } catch (e: unknown) {
            res.redirect(`/suchergebnis?ubid=${data.ubid}&errorMessage=` + encodeURIComponent((e as Error).message));
        }
    }

    async getGefundene(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            res.send(`${JSON.stringify(await DBAktivitaet.getGefundeneBaureihen(sessiontoken))}`);
        } catch (e) {
            res.send((e as Error).message);
        }
    }
}