import { Request, Response } from "express";

import { Nutzer } from "../models/Nutzer";
import { Freundesliste as DBFreundesliste } from "../models/Freundesliste";

import { API } from "../API";

import { ValidationError } from "../error/ValidationError";

export class Freundesliste {
    async add(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.add(sessiontoken as string, data.uuid);
            res.send(`{ "successMessage": "Freund wurde erfolgreich hinzugefügt." }`);
        });
    }

    async remove(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.remove(sessiontoken as string, data.uuid);
            res.send(`{ "successMessage": "Freund wurde erfolgreich entfernt." }`);
        });
    }

    async baureihenVonFreundenAbrufen(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            let data: any = await DBFreundesliste.baureihenVonFreundenAbrufen(sessiontoken as string);
            res.send(`${JSON.stringify(data)}`);
        });
    }

    async getRanking(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            let data: any = await DBFreundesliste.getRanking(sessiontoken as string);
            if (data && data.Freunde) data = data.Freunde;
            res.send(`${JSON.stringify(data)}`);
        });
    }

    async akzeptiereFreundschaftsanfrage(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.akzeptiereFreundschaftsanfrage(sessiontoken as string, data.uuid);
            res.send(`{ "successMessage": "Freund erfolgreich hinzugefügt." }`);
        });
    }

    async getAusstehendeFreundschaftsanfragen(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            let result: any = await DBFreundesliste.getAusstehendeFreundschaftsanfragen(sessiontoken as string);
            res.send(`${JSON.stringify(result)}`);
        });
    }

    async FreundschaftsanfrageAblehnen(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.deleteAnfrage(data.uuid, await Nutzer.getUUID(sessiontoken as string));
            res.send(`{ "successMessage": "Anfrage erfolgreich abgelehnt." }`);
        });
    }

    async abortFreundschaftsanfrage(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.deleteAnfrage(await Nutzer.getUUID(sessiontoken as string), data.uuid);
            res.send(`{ "successMessage": "Anfrage erfolgreich zurückgezogen." }`);
        })
    }
}