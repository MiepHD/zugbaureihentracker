import { Request, Response } from "express";

import { Baureihe as DBBaureihe } from "../models/Baureihe";
import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";

import { API } from "../API";

import { ValidationError } from "../error/ValidationError";
import { ForbiddenError } from "../error/ForbiddenError";

export class Baureihe {
    /**
     * Gibt die Request die Information zu einer Baureihe zu bekommen an die Datenbank weiter
     * @author Lia
     * @return Im JSON-Format
     */
    async get(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            res.send(`{
                "baureihe": ${JSON.stringify(await DBBaureihe.get(data.ubid as string))},
                "gefunden": ${JSON.stringify(await DBAktivitaet.istGefunden((data.ubid as string), sessiontoken as string))},
                "gefahren": ${JSON.stringify(await DBAktivitaet.istGefahren((data.ubid as string), sessiontoken as string))}
            }`);
        });
    }

    async count(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            res.send(`${await DBBaureihe.getCount()}`);
        });
    }

    async add(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("addBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.beschreibung)) throw new ValidationError("beschreibung");
            
            await DBBaureihe.add(data.ubid, data.name, data.beschreibung);
            res.send(`{ successMessage: "Baureihe wurde erfolgreich erstellt." }`);
            console.log(`Es wurde eine neue Baureihe hinzugefügt mit der ubid: ${data.ubid}`);
        });
    }

    async getAll(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("getAllBaureihen");
            res.send(`${JSON.stringify(await DBBaureihe.getAll())}`);
        });
    }

    async remove(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, async (data, sessiontoken) => {
            let force = false;
            if (data.force) force = true;
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("deleteBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            
            await DBBaureihe.remove(data.ubid, force);
            res.send(`{ "successMessage": "Baureihe wurde erfolgreich gelöscht." }`);
            console.log(`Es wurde die Baureihe mit der ubid ${data.ubid} gelöscht.`);
        });
    }

    async edit(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("editBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.beschreibung)) throw new ValidationError("beschreibung");
            
            await DBBaureihe.edit(data.ubid, data.name, data.beschreibung);
            res.send(`{ "ubid": "${data.ubid}", "successMessage": "Baureihe wurde erfolgreich geändert." }`);
            console.log(`Die Baureihe mit der ubid ${data.ubid} wurde geändert.`);
        });
    }
}