import { Request, Response } from "express";

import { Baureihe as DBBaureihe } from "../models/Baureihe";
import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Aktivitaet as DBAktivitaet } from "../models/Aktivitaet";

import { API } from "./API";

import { ValidationError } from "../error/ValidationError";
import { ForbiddenError } from "../error/ForbiddenError";

export class Baureihe {
    /**
     * Gibt die Request die Information zu einer Baureihe zu bekommen an die Datenbank weiter
     * @author Lia
     * @return Im JSON-Format
     */
    async get(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            res.send(`{
                "baureihe": ${JSON.stringify(await DBBaureihe.get(data.ubid as string))},
                "gefunden": ${JSON.stringify(await DBAktivitaet.istGefunden((data.ubid as string), sessiontoken as string))}
            }`);
        });
    }

    async count(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            res.send(`${await DBBaureihe.getCount()}`);
        });
    }

    async add(req: Request, res: Response) {
        await API.try(req, res, true, "add?", async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("addBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.beschreibung)) throw new ValidationError("beschreibung");
            
            await DBBaureihe.add(data.ubid, data.name, data.beschreibung);
            res.redirect("/add?successMessage=" + "Baureihe wurde erfolgreich erstellt.");
        });
    }

    async getAll(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("getAllBaureihen");
            res.send(`${JSON.stringify(await DBBaureihe.getAll())}`);
        });
    }

    async remove(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, `baureihen?ubid=${data.ubid}&`, async (data, sessiontoken) => {
            let force = false;
            if (data.force) force = true;
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("deleteBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            
            await DBBaureihe.remove(data.ubid, force);
            res.redirect("/baureihen?successMessage=" + "Baureihe wurde erfolgreich gelöscht.");
        });
    }

    async edit(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, `editor?ubid=${data.ubid}&`, async (data, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("editBaureihe");
            if (!API.isValidString(data.ubid)) throw new ValidationError("ubid");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.beschreibung)) throw new ValidationError("beschreibung");
            
            await DBBaureihe.edit(data.ubid, data.name, data.beschreibung);
            res.redirect("/editor?ubid=" + data.ubid + "&successMessage=" + "Baureihe wurde erfolgreich geändert.");
        });
    }
}