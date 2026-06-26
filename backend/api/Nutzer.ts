import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";

import { API } from "./API";

export class Nutzer {
    async logout(req: Request, res: Response) {
        res.clearCookie("sessiontoken", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });
        const data: any = req.query;
        if (data.errorMessage) {
            res.redirect("/login?errorMessage=" + encodeURIComponent(data.errorMessage));
        } else {
            res.redirect("/login");
        }
    }

    /**
     * Lia
     * Gibt die Anfrage des Servers, eine Registrierung durchzuführen an die Datenbank weiter, damit diese einen neuen Nutzer speichern kann. Bei Erfolg Weiterleitung zur Login Seite, sonst auf Registrieren Seite bleiben.
     */
    async registrieren(req: Request, res: Response) {
        const data = req.body;
        try {
            if (!API.isValidString(data.username)) throw new Error("Nutzername ist fehlerhaft.");
            if (!API.isValidString(data.passwort)) throw new Error("Passwort ist fehlerhaft.");
            if (!API.isValidString(data.code)) throw new Error("Code ist fehlerhaft.");
            await DBNutzer.add(data.username, await this.sha256Hex(data.passwort), data.code);
            res.redirect("/login?successMessage=" + encodeURIComponent("Registrierung erfolgreich abgeschlossen."));
        } catch (e) {
            res.redirect("/registrieren?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    /**
     * Lia
     * Gibt die des Servers einen Login durchzuführen an die Datenbank weiter 
     */
    async anmelden(req: Request, res: Response) {
        const data = req.body;
        try {
            if (!API.isValidString(data.username)) throw new Error("Nutzername ist fehlerhaft.");
            if (!API.isValidString(data.passwort)) throw new Error("Passwort ist fehlerhaft.");
            const sessiontoken = await DBNutzer.getSessiontoken(
                data.username, 
                await this.sha256Hex(data.passwort)
            );
            res.cookie("sessiontoken", sessiontoken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            res.redirect("/home");
        } catch (e) {
            res.redirect("/login?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async getUUID(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            res.send(await DBNutzer.getUUID(sessiontoken));
        } catch (e: unknown) {
            res.redirect("/logout");
            console.warn((e as Error).message);
        }
    }

    async elevate(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            await DBNutzer.elevate(req.cookies.sessiontoken);
            res.redirect("/home?successMessage=" + encodeURIComponent("Adminrechte erfolgreich erlangt."));
        } catch (e: unknown) {
            res.redirect("/elevate?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async isElevated(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            const isElevated = await DBNutzer.isElevated(req.cookies.sessiontoken);
            res.send(`{ "isElevated": ${isElevated} }`);
        } catch (e: unknown) {
            res.send((e as Error).message);
        }
    }

    async elevateByUUID(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Adminrechte zu vergeben.");
            await DBNutzer.elevateByUUID(data.uuid);
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich Adminrechte hinzugefügt."));
        } catch (e: unknown) {
            res.redirect("/accounts?errorMessage=" + encodeURIComponent((e as Error).message));
        }
    }

    async getAll(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        try {
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Liste der Accounts abzufragen.");
            res.send(`${JSON.stringify(await DBNutzer.getAll())}`);
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
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Account zu löschen.");
            await DBNutzer.remove(data.uuid, force);
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich gelöscht"));
        } catch (e: unknown) {
            res.redirect("/accounts?errorMessage=" + encodeURIComponent((e as Error).message) + "&uuid=" + data.uuid);
        }
    }

    async removeAdmin(req: Request, res: Response) {
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        const data = req.body;
        try {
            if (!API.isValidString(data.uuid)) throw new Error("UUID ist fehlerhaft.");
            if (!await DBNutzer.isElevated(sessiontoken)) throw new Error("Keine Berechtigung Adminrechte zu entfernen.");
            await DBNutzer.removeAdmin(data.uuid)
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich Adminrechte entfernt."));
        } catch (e: unknown) {
            res.redirect("/accounts?errorMessage=" + encodeURIComponent((e as Error).message));
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
        try {
            if (sessiontoken == undefined) throw new Error("Keine gültige Sitzung");
            await DBNutzer.getNutzer(sessiontoken)
        } catch (e: unknown) {
            res.redirect("/logout?errorMessage=" + encodeURIComponent((e as Error).message));
            return null;
        }
        return sessiontoken;
    }
}