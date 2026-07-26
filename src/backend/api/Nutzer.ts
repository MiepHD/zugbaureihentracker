import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";

import { API } from "../API";

import { UnauthorizedError } from "../error/UnauthorizedError";
import { ForbiddenError } from "../error/ForbiddenError";
import { ValidationError } from "../error/ValidationError";
import { Sessiontoken } from "../models/Sessiontoken";

export class Nutzer {
    /**
     * Lia
     * Gibt die Anfrage des Servers, eine Registrierung durchzuführen an die Datenbank weiter, damit diese einen neuen Nutzer speichern kann. Bei Erfolg Weiterleitung zur Login Seite, sonst auf Registrieren Seite bleiben.
     */
    async registrieren(req: Request, res: Response) {
        await API.try(req, res, false, async (data, ignored) => {
            if (!API.isValidString(data.username)) throw new ValidationError("username");
            if (!API.isValidString(data.passwort)) throw new ValidationError("passwort");
            if (!API.isValidString(data.code)) throw new ValidationError("code");
            await DBNutzer.add(data.username, await this.sha256Hex(data.passwort), data.code);
            res.send(`{ "successMessage": "Registrierung erfolgreich abgeschlossen." }`);
            console.log(`${data.username} hat sich mit dem Code ${data.code} registriert.`);
        });
    }

    /**
     * Lia
     * Gibt die des Servers einen Login durchzuführen an die Datenbank weiter 
     */
    async anmelden(req: Request, res: Response) {
        await API.try(req, res, false, async (data, ignored) => {
            if (!API.isValidString(data.username)) throw new ValidationError("username");
            if (!API.isValidString(data.passwort)) throw new ValidationError("passwort");
            const sessiontoken = await DBNutzer.getSessiontoken(
                data.username, 
                await this.sha256Hex(data.passwort)
            );
            res.cookie("sessiontoken", sessiontoken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.send(`{ "successMessage": "Erfolreich angemeldet." }`);
        });
    }

    async getUUID(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            res.send(await DBNutzer.getUUID(sessiontoken as string));
        });
    }

    async getNutzername(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            const uuid = await DBNutzer.getUUID(sessiontoken as string);
            res.send((await DBNutzer.getNutzerByUUID((data.uuid ? data.uuid : uuid) as string)).getDataValue("name"));
        });
    }

    async elevate(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            await DBNutzer.elevate(sessiontoken as string);
            res.send(`{ "successMessage": "Adminrechte erfolgreich erlangt." }`);
            console.log(`${(await DBNutzer.getNutzer(sessiontoken as string)).getDataValue("name")} hat Adminrechte erlangt.`);
        });
    }

    async isElevated(req: Request, res: Response) {
        const sessiontoken = req.cookies.sessiontoken;
        await API.try(req, res, false, async () => {
            if (sessiontoken == undefined || sessiontoken == null || sessiontoken == "" || !await Sessiontoken.isValidSessiontoken(sessiontoken)) throw new UnauthorizedError("noSession", false);
            const isElevated = await DBNutzer.isElevated(sessiontoken as string);
            res.send(`{ "isElevated": ${isElevated} }`);
        });
    }

    async elevateByUUID(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidUUID(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("elevateOtherUser");
            await DBNutzer.elevateByUUID(data.uuid);
            res.send(`{ "successMessage": "Account erfolgreich Adminrechte hinzugefügt." }`);
            console.log(`${(await DBNutzer.getNutzer(sessiontoken as string)).getDataValue("name")} hat Adminrechte an ${(await DBNutzer.getNutzerByUUID(data.uuid)).getDataValue("name")} vergeben.`);
        });
    }

    async getAll(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("listAccounts");
            res.send(`${JSON.stringify(await DBNutzer.getAll())}`);
        });
    }

    async remove(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            let force = false;
            if (data.force) force = true;
            if (!API.isValidUUID(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("deleteAccount");
            await DBNutzer.remove(data.uuid, force);
            res.send(`{ "successMessage": "Account erfolgreich gelöscht" }`);
            console.log(`${(await DBNutzer.getNutzer(sessiontoken as string)).getDataValue("name")} hat den Account von ${(await DBNutzer.getNutzerByUUID(data.uuid)).getDataValue("name")} gelöscht.`);
        });
    }

    async removeAdmin(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!API.isValidUUID(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("removeElevation");
            await DBNutzer.removeAdmin(data.uuid)
            res.send(`{ "successMessage": "Account erfolgreich Adminrechte entfernt." }`);
            console.log(`${(await DBNutzer.getNutzer(sessiontoken as string)).getDataValue("name")} hat ${(await DBNutzer.getNutzerByUUID(data.uuid)).getDataValue("name")} die Adminrechte genommen.`);
        });
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
        if (sessiontoken == undefined || sessiontoken == null || sessiontoken == "" || !await Sessiontoken.isValidSessiontoken(sessiontoken)) throw new UnauthorizedError("noSession");
        return sessiontoken;
    }
}