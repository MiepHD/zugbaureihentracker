import { Request, Response } from "express";

import { Baureihe as DBBaureihe } from "../models/Baureihe";
import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";

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
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            res.send(`{
                "baureihe": ${JSON.stringify(await DBBaureihe.get(data.ubid as string))},
                "gefunden": ${JSON.stringify(await DBAktivitaet.istGefunden((data.ubid as string), sessiontoken))}
            }`);
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
        
        const data = req.body;
        try {
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Baureihen hinzuzufügen.");
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            if (!API.isValidString(data.name)) throw new Error("Name ist fehlerhaft.");
            if (!API.isValidString(data.beschreibung)) throw new Error("Beschreibung ist fehlerhaft.");
            
            await DBBaureihe.add(data.ubid, data.name, data.beschreibung);
            res.redirect("/add?successMessage=" + "Baureihe wurde erfolgreich erstellt.");
        } catch (e: unknown) {
            res.redirect("/add?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async getAll(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung alle Baureihen abzufragen.");
            res.send(`${JSON.stringify(await DBBaureihe.getAll())}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }

    async remove(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        
        const data = req.body;
        let force = false;
        if (data.force) force = true;
        try {
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Baureihen zu löschen.");
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            
            await DBBaureihe.remove(data.ubid, force);
            res.redirect("/baureihen?successMessage=" + "Baureihe wurde erfolgreich gelöscht.");
        } catch (e: unknown) {
            res.redirect("/baureihen?errorMessage=" + encodeURIComponent((e as Error).message) + "&ubid=" + data.ubid);
        }
    }

    async edit(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        
        const data = req.body;
        try {
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Baureihen zu ändern.");
            if (!API.isValidString(data.ubid)) throw new Error("UBID ist fehlerhaft.");
            if (!API.isValidString(data.name)) throw new Error("Name ist fehlerhaft.");
            if (!API.isValidString(data.beschreibung)) throw new Error("Beschreibung ist fehlerhaft.");
            
            await DBBaureihe.edit(data.ubid, data.name, data.beschreibung);
            res.redirect("/editor?ubid=" + data.ubid + "&successMessage=" + "Baureihe wurde erfolgreich geändert.");
        } catch (e: unknown) {
            res.redirect("/editor?ubid=" + data.ubid + "&?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }
}