import { Request, Response } from "express";

import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";

import { API } from "./API";
import { Nutzer } from "../models/Nutzer";

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
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            await DBAktivitaet.alsGefundenMarkieren(sessiontoken, data.ubid);
            res.redirect("/home?successMessage=" + encodeURIComponent(`Baureihe wurde als "Gefunden" markiert.`));
        } catch (e: unknown) {
            res.redirect(`/suchergebnis?ubid=${data.ubid}&errorMessage=` + encodeURIComponent((e as Error).message));
        }
    }

    async getGefundene(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.query;
        try {
            const uuid = await Nutzer.getUUID(sessiontoken);
            res.send(`${JSON.stringify(await DBAktivitaet.getGefundeneBaureihen((data.uuid ? data.uuid : uuid) as string))}`);
        } catch (e) {
            res.send((e as Error).message);
        }
    }

    async alsNichtGefundenMarkieren(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            await DBAktivitaet.alsNichtGefundenMarkieren(sessiontoken, data.ubid);
            res.redirect("/home?successMessage=" + encodeURIComponent("Baureihe wurde erfolgreich aus den gefundenen Baureihen entfernt"));
        } catch (e: unknown) {
            res.redirect(`/suchergebnis?ubid=${data.ubid}&errorMessage=` + encodeURIComponent((e as Error).message));
        }
    }
}