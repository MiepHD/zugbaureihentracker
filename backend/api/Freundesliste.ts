import { Request, Response } from "express";

import { Freundesliste as DBFreundesliste } from "../models/Freundesliste";

import { API } from "./API";

export class Freundesliste {
    async add(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            const success = await DBFreundesliste.add(sessiontoken, data.uuid);
            if (success) {
                res.redirect("/freunde");
            } else {
                res.send(`{ "success": ${success}`);
            }
        } catch (e: any) {
            res.send((e as Error).message);
        }
    }

    async remove(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            const success = await DBFreundesliste.remove(sessiontoken, data.uuid);
            if (success) {
                res.redirect("/freunde");
            } else {
                res.send(`{ "success": ${success}`);
            }
        } catch (e: any) {
            res.send((e as Error).message);
        }
    }

    async baureihenVonFreundenAbrufen(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        let data: any = await DBFreundesliste.baureihenVonFreundenAbrufen(sessiontoken);
        if (data && data.Freunde) data = data.Freunde;
        res.send(`${JSON.stringify(data)}`);
    }
}