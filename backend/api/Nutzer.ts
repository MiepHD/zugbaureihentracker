import { Request, Response } from "express";

import { Nutzer as DBNutzer } from "../models/Nutzer";

import { API } from "./API";

import { UnauthorizedError } from "../error/UnauthorizedError";
import { ForbiddenError } from "../error/ForbiddenError";
import { ValidationError } from "../error/ValidationError";

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
        await API.try(req, res, false, "registrieren?", async (data, ignored) => {
            if (!API.isValidString(data.username)) throw new ValidationError("username");
            if (!API.isValidString(data.passwort)) throw new ValidationError("passwort");
            if (!API.isValidString(data.code)) throw new ValidationError("code");
            await DBNutzer.add(data.username, await this.sha256Hex(data.passwort), data.code);
            res.redirect("/login?successMessage=" + encodeURIComponent("Registrierung erfolgreich abgeschlossen."));
        });
    }

    /**
     * Lia
     * Gibt die des Servers einen Login durchzuführen an die Datenbank weiter 
     */
    async anmelden(req: Request, res: Response) {
        await API.try(req, res, false, "login?", async (data, ignored) => {
            if (!API.isValidString(data.username)) throw new ValidationError("username");
            if (!API.isValidString(data.passwort)) throw new ValidationError("passwort");
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
        });
    }

    async getUUID(req: Request, res: Response) {
        await API.try(req, res, true, false, async (ignored, sessiontoken) => {
            res.send(await DBNutzer.getUUID(sessiontoken as string));
        });
    }

    async getNutzername(req: Request, res: Response) {
        await API.try(req, res, true, false, async (data, sessiontoken) => {
            const uuid = await DBNutzer.getUUID(sessiontoken as string);
            res.send((await DBNutzer.getNutzerByUUID((data.uuid ? data.uuid : uuid) as string)).getDataValue("name"));
        });
    }

    async elevate(req: Request, res: Response) {
        await API.try(req, res, true, "elevate?", async (ignored, sessiontoken) => {
            await DBNutzer.elevate(sessiontoken as string);
            res.redirect("/home?successMessage=" + encodeURIComponent("Adminrechte erfolgreich erlangt."));
        });
    }

    async isElevated(req: Request, res: Response) {
        await API.try(req, res, true, false, async (ignored, sessiontoken) => {
            const isElevated = await DBNutzer.isElevated(sessiontoken as string);
            res.send(`{ "isElevated": ${isElevated} }`);
        });
    }

    async elevateByUUID(req: Request, res: Response) {
        await API.try(req, res, true, "accounts?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("elevateOtherUser");
            await DBNutzer.elevateByUUID(data.uuid);
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich Adminrechte hinzugefügt."));
        });
    }

    async getAll(req: Request, res: Response) {
        await API.try(req, res, true, false, async (ignored, sessiontoken) => {
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("listAccounts");
            res.send(`${JSON.stringify(await DBNutzer.getAll())}`);
        });
    }

    async remove(req: Request, res: Response) {
        const data = req.body;
        await API.try(req, res, true, `accounts?uuid=${data.uuid}&`, async (data, sessiontoken) => {
            let force = false;
            if (data.force) force = true;
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("deleteAccount");
            await DBNutzer.remove(data.uuid, force);
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich gelöscht"));
        });
    }

    async removeAdmin(req: Request, res: Response) {
        await API.try(req, res, true, "accounts?", async (data, sessiontoken) => {
            if (!API.isValidString(data.uuid)) throw new ValidationError("uuid");
            if (!await DBNutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("removeElevation");
            await DBNutzer.removeAdmin(data.uuid)
            res.redirect("/accounts?successMessage=" + encodeURIComponent("Account erfolgreich Adminrechte entfernt."));
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
        try {
            if (sessiontoken == undefined) throw new UnauthorizedError("noSession");
            await DBNutzer.getNutzer(sessiontoken)
        } catch (e: unknown) {
            res.redirect("/logout?errorMessage=" + encodeURIComponent((e as Error).message));
            return null;
        }
        return sessiontoken;
    }
}