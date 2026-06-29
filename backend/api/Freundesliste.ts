import { Request, Response } from "express";

import { Freundesliste as DBFreundesliste } from "../models/Freundesliste";

import { API } from "./API";
import { Nutzer } from "../models/Nutzer";

export class Freundesliste {
    async add(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.add(sessiontoken, data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Freund wurde erfolgreich hinzugefügt."));
        } catch (e: any) {
            res.redirect("/freundschaftsanfragen?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async remove(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.remove(sessiontoken, data.uuid);
            res.redirect("/leaderboard?successMessage=" + encodeURIComponent("Freund wurde erfolgreich entfernt."));
        } catch (e: unknown) {
            res.redirect("/leaderboard?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async baureihenVonFreundenAbrufen(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            let data: any = await DBFreundesliste.baureihenVonFreundenAbrufen(sessiontoken);
            res.send(`${JSON.stringify(data)}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }

    async getRanking(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            let data: any = await DBFreundesliste.getRanking(sessiontoken);
            if (data && data.Freunde) data = data.Freunde;
            res.send(`${JSON.stringify(data)}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }

    async akzeptiereFreundschaftsanfrage(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.akzeptiereFreundschaftsanfrage(sessiontoken, data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Freund erfolgreich hinzugefügt."));
        } catch (e: unknown) {
            res.send("/freundschaftsanfragen?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async getAusstehendeFreundschaftsanfragen(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            let result: any = await DBFreundesliste.getAusstehendeFreundschaftsanfragen(sessiontoken);
            res.send(`${JSON.stringify(result)}`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }

    async FreundschaftsanfrageAblehnen(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.deleteAnfrage(data.uuid, await Nutzer.getUUID(sessiontoken));
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Anfrage erfolgreich abgelehnt."));
        } catch (e: unknown) {
            res.redirect("/freundschaftsanfragen?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async abortFreundschaftsanfrage(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            await DBFreundesliste.deleteAnfrage(await Nutzer.getUUID(sessiontoken), data.uuid);
            res.redirect("/freundschaftsanfragen?successMessage=" + encodeURIComponent("Anfrage erfolgreich zurückgezogen."));
        } catch (e: unknown) {
            res.redirect("/freundschaftsanfragen?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }
}