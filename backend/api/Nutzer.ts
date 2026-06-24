import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";

import { API } from "./API";

export class Nutzer {
    constructor() {
        API.checkSessiontoken = Nutzer.checkSessiontoken;
    }

    async logout(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        res.clearCookie("sessiontoken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        res.redirect("/login");
    }

    /**
     * Lia
     * Gibt die Anfrage des Servers, eine Registrierung durchzuführen an die Datenbank weiter, damit diese einen neuen Nutzer speichern kann. Bei Erfolg Weiterleitung zur Login Seite, sonst auf Registrieren Seite bleiben.
     */
    async registrieren(req: Request, res: Response) {
        const data = req.body;
        if (data.username == "" || data.passwort == "" || data.code == "") {res.redirect("/registrieren"); return;}
        const success = await DBNutzer.add(data.username, await this.sha256Hex(data.passwort), data.code);
        if (success) {
            res.redirect("/login");
        } else {
            res.redirect("/registrieren");
        }
    }

    /**
     * Lia
     * Gibt die des Servers einen Login durchzuführen an die Datenbank weiter 
     */
    async anmelden(req: Request, res: Response) {
        const data = req.body;
        console.log(`${data.username}${data.passwort}`);
        if (data.username == "" || data.passwort == "") {res.redirect("/login"); return;}
        const sessiontoken = await DBNutzer.getSessiontoken(data.username, await this.sha256Hex(data.passwort));
        if (!sessiontoken) {res.redirect("/login"); return;}
        res.cookie("sessiontoken", sessiontoken, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        res.redirect("/home");
    }

    async getUUID(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        res.send(await DBNutzer.getUUID(sessiontoken));
    }

    async elevate(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const success = await DBNutzer.elevate(req.cookies.sessiontoken);
        if (success) {
            res.redirect("/home");
        } else {
            res.send(success);
        }
    }

    /**
     * @author Tim
     * @param message Hasht das Passwort
     * @returns gehashtes Passwort
     */
    private async sha256Hex(message: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 
     * @param req 
     * @param res 
     * @returns Sessiontoken
     */
    static async checkSessiontoken(req: Request, res: Response): Promise<string | null> {
        const sessiontoken = req.cookies.sessiontoken;
        if (sessiontoken == undefined || await DBNutzer.getNutzer(sessiontoken) == null) {
            res.status(401);
            res.send();
            return null;
        }
        return sessiontoken;
    }
}