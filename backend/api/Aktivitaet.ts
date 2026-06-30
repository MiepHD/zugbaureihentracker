import { Request, Response } from "express";

import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";
import { Nutzer } from "../models/Nutzer";
import { Freundesliste } from "../models/Freundesliste";

import { API } from "./API";

import { ValidationError } from "../error/ValidationError";
import { ForbiddenError } from "../error/ForbiddenError";

export class Aktivitaet {
    /**
     * Gibt die Request, eine Baureihe als gefunden zu markieren an die Datenbank weiter und je nach Anwort Redirected entweder auf die Home Seite oder auf die Suchergebnis Seite.
     * @author Lia
     */
    async alsGefundenMarkieren(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, `suchergebnis?ubid=${data.ubid}&`, async (data, sessiontoken) => {
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            await DBAktivitaet.alsGefundenMarkieren(sessiontoken as string, data.ubid);
            res.redirect("/home?successMessage=" + encodeURIComponent(`Baureihe wurde als "Gefunden" markiert.`));
        });
    }

    async getGefundene(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            const uuid = await Nutzer.getUUID(sessiontoken as string);
            if (data.uuid) {
                if(await Freundesliste.sindBefreundet(uuid, data.uuid as string) || await Nutzer.isElevated(sessiontoken as string)) {
                    res.send(`${JSON.stringify(await DBAktivitaet.getGefundeneBaureihen((data.uuid) as string))}`);
                    return;
                }
                throw new ForbiddenError("profile");
            }
            res.send(`${JSON.stringify(await DBAktivitaet.getGefundeneBaureihen(uuid))}`);
        });
    }

    async alsNichtGefundenMarkieren(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, `suchergebnis?ubid=${data.ubid}&`, async (data, sessiontoken) => {
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            await DBAktivitaet.alsNichtGefundenMarkieren(sessiontoken as string, data.ubid);
            res.redirect("/home?successMessage=" + encodeURIComponent("Baureihe wurde erfolgreich aus den gefundenen Baureihen entfernt"));
        });
    }
}