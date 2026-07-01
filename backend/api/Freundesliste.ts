import { Request, Response } from "express";

import { Freundesliste as DBFreundesliste } from "../models/Freundesliste";

import { API } from "../API";
import { Nutzer } from "../models/Nutzer";

import { ValidationError } from "../error/ValidationError";

export class Freundesliste {
    async add(req: Request, res: Response) {
        await API.try(req, res, true, "freundschaftsanfragen?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.add(sessiontoken as string, data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Freund wurde erfolgreich hinzugefügt."));
        });
    }

    async remove(req: Request, res: Response) {
        await API.try(req, res, true, "leaderboard?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.remove(sessiontoken as string, data.uuid);
            res.redirect("/leaderboard?successMessage=" + encodeURIComponent("Freund wurde erfolgreich entfernt."));
        });
    }

    async baureihenVonFreundenAbrufen(req: Request, res: Response) {
        await API.try(req, res, true, false, async (ignored, sessiontoken) => {
            let data: any = await DBFreundesliste.baureihenVonFreundenAbrufen(sessiontoken as string);
            res.send(`${JSON.stringify(data)}`);
        });
    }

    async getRanking(req: Request, res: Response) {
        await API.try(req, res, true, false, async (ignored, sessiontoken) => {
            let data: any = await DBFreundesliste.getRanking(sessiontoken as string);
            if (data && data.Freunde) data = data.Freunde;
            res.send(`${JSON.stringify(data)}`);
        });
    }

    async akzeptiereFreundschaftsanfrage(req: Request, res: Response) {
        await API.try(req, res, true, "freundschaftsanfragen?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.akzeptiereFreundschaftsanfrage(sessiontoken as string, data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Freund erfolgreich hinzugefügt."));
        });
    }

    async getAusstehendeFreundschaftsanfragen(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            let result: any = await DBFreundesliste.getAusstehendeFreundschaftsanfragen(sessiontoken as string);
            res.send(`${JSON.stringify(result)}`);
        });
    }

    async FreundschaftsanfrageAblehnen(req: Request, res: Response) {
        await API.try(req, res, true, "freundschaftsanfragen?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.deleteAnfrage(data.uuid, await Nutzer.getUUID(sessiontoken as string));
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Anfrage erfolgreich abgelehnt."));
        });
    }

    async abortFreundschaftsanfrage(req: Request, res: Response) {
        await API.try(req, res, true, "freundschaftsanfragen?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            await DBFreundesliste.deleteAnfrage(await Nutzer.getUUID(sessiontoken as string), data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Anfrage erfolgreich zurückgezogen."));
        })
    }
}