import { Sequelize } from "sequelize";
import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";

import { Database } from "../Database";

import { Baureihe } from "./Baureihe";
import { Freundesliste } from "./Freundesliste";
import { Nutzer } from "./Nutzer";
import { Aktivitaet } from "./Aktivitaet";
import { Registrierungscodes } from "./Registierungscodes";

import { ExpectedError } from "../error/ExpectedError";
import { randomUUID } from "crypto";
import { UnauthorizedError } from "../error/UnauthorizedError";
import { ForbiddenError } from "../error/ForbiddenError";

export class API {
    private adminpasswort: string;
    static db: Database;
    static checkSessiontoken: typeof Nutzer.checkSessiontoken = Nutzer.checkSessiontoken;

    constructor(sequelize: Sequelize, adminpasswort: string | null) {
        if (adminpasswort) {
            this.adminpasswort = adminpasswort;
        } else {
            try {
                this.adminpasswort = fs.readFileSync(path.join(__dirname, '../config/pass.txt'), 'utf8').replace("\n", "");
                console.log("Es wird das Passwort aus der /backend/config/pass.txt verwendet.");
            } catch {
                console.warn("Das Masterpasswort konnte nicht geladen werden. Es wird auf das UNSICHERE Standardpasswort zurückgegriffen.");
                this.adminpasswort = "Das Adminpasswort";
            }
        }
        API.db = new Database(sequelize);
        API.db.init();
    }

    public async init(app: Express): Promise<void> {
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cookieParser());
        await this.bindListeners(app);
    }

    public async bindListeners(app: Express) {
        const nutzer = new Nutzer();
        app.get("/logout", nutzer.logout.bind(nutzer));
        app.post("/api/registrieren", nutzer.registrieren.bind(nutzer));
        app.post("/api/anmelden", nutzer.anmelden.bind(nutzer));
        app.get("/api/getUUID", nutzer.getUUID.bind(nutzer));
        app.get("/api/getAccounts", nutzer.getAll.bind(nutzer));
        app.post("/api/removeAccount", nutzer.remove.bind(nutzer));
        app.get("/api/isElevated", nutzer.isElevated.bind(nutzer));
        app.get("/api/getNutzername", nutzer.getNutzername.bind(nutzer));
        app.post("/api/removeAdmin", (req: Request, res: Response) => {
            if (this.authorize(req, res, "elevate")) nutzer.removeAdmin(req, res);
        });
        app.post("/api/addAdmin", (req: Request, res: Response) => {
            if (this.authorize(req, res, "elevate")) nutzer.elevateByUUID(req, res);
        });
        app.post("/api/elevate", (req: Request, res: Response) => {
            if (this.authorize(req, res, "elevate")) nutzer.elevate(req, res);
        });

        const registrierungscodes = new Registrierungscodes();
        app.post("/api/addInviteCode", (req: Request, res: Response) => {
            registrierungscodes.add(req, res, req.body.passwort == this.adminpasswort)
        });

        const baureihe = new Baureihe();
        app.get("/api/getBaureihe", baureihe.get.bind(baureihe));
        app.get("/api/getBaureihen", baureihe.getAll.bind(baureihe));
        app.get("/api/getGesamtzahlBaureihen", baureihe.count.bind(baureihe));
        app.post("/api/addBaureihe", baureihe.add.bind(baureihe));
        app.post("/api/removeBaureihe", baureihe.remove.bind(baureihe));
        app.post("/api/editBaureihe", baureihe.edit.bind(baureihe));

        const aktivitaet = new Aktivitaet();
        app.post("/api/baureiheAlsGefundenMarkieren", aktivitaet.alsGefundenMarkieren.bind(aktivitaet));
        app.post("/api/baureiheAlsNichtGefundenMarkieren", aktivitaet.alsNichtGefundenMarkieren.bind(aktivitaet));
        app.get("/api/getGefundeneBaureihen", aktivitaet.getGefundene.bind(aktivitaet));

        const freundesliste = new Freundesliste();
        app.post("/api/fuegeFreundHinzu", freundesliste.add.bind(freundesliste));
        app.post("/api/entferneFreund", freundesliste.remove.bind(freundesliste));
        app.get("/api/baureihenVonFreundenAbrufen", freundesliste.baureihenVonFreundenAbrufen.bind(freundesliste));
        app.get("/api/getFriendsLeaderboard", freundesliste.getRanking.bind(freundesliste));
        app.post("/api/akzeptiereFreundschaftsanfrage", freundesliste.akzeptiereFreundschaftsanfrage.bind(freundesliste));
        app.post("/api/abortFreundschaftsanfrage", freundesliste.abortFreundschaftsanfrage.bind(freundesliste));
        app.post("/api/FreundschaftsanfrageAblehnen", freundesliste.FreundschaftsanfrageAblehnen.bind(freundesliste));
        app.get("/api/getAusstehendeFreundschaftsanfragen", freundesliste.getAusstehendeFreundschaftsanfragen.bind(freundesliste));
    }

    private authorize(req: Request, res: Response, redirect: string) {
        if (req.body.passwort !== this.adminpasswort) {
            console.warn(`Jemand hat ein falsches Masterpasswort auf /${redirect} eingegeben.`);
            res.redirect(`/${redirect}?errorMessage=` + encodeURIComponent("403: Das Passwort ist falsch."));
            return false;
        }
        return true;
    }

    static isValidString(str: unknown) {
        return str !== null && typeof str === "string" && str !== ""
    }

    /**
     * @param checkSessiontoken Ob das Sessiontoken überprüft wird. Bei false kommt bei execute als sessiontoken null
     * @param redirectOnError Beginnt ohne / und endet mit & oder ?. Alternativ kann man auch false übergeben, dass kein redirect ausgeführt wird
     * @param execute Bekommt die Daten übergeben und ein Sessiontoken falls eines angefordert wurde
     */
    static async try(req: Request, res: Response, checkSessiontoken: boolean, redirectOnError: string | boolean, execute: (data: any, sessiontoken: string | null) => Promise<void>) {
        let data;
        if (req.method == "GET") data = req.query;
        else data = req.body;
        try {
            if (checkSessiontoken) {
                const sessiontoken = await API.checkSessiontoken(req, res);
                await execute(data, sessiontoken);
                return;
            }
            await execute(data, null); }
        catch (e: unknown) {
            if (e instanceof ExpectedError) {
                res.status(e.statuscode);
                if (typeof redirectOnError == "boolean" && !redirectOnError) {
                    res.send(`${e.statuscode}: ${(e as Error).message}`);
                } else {
                    if (e instanceof UnauthorizedError) redirectOnError = "login?";
                    if (e instanceof ForbiddenError) redirectOnError = "home?";
                    res.redirect(
                        `/${redirectOnError}errorMessage=` +
                        encodeURIComponent(`${e.statuscode}: ${(e as Error).message}`)
                    );
                }
                return;
            }
            const uuid = randomUUID();
            res.status(500);
            if (typeof redirectOnError == "boolean" && !redirectOnError) {
                res.send(`500: Es ist ein unerwarteter Fehler auf dem Server aufgetreten. (${uuid})`);
            } else {
                res.redirect(
                    `/${redirectOnError}errorMessage=` +
                    encodeURIComponent(`500: Es ist ein unerwarteter Fehler auf dem Server aufgetreten. (${uuid})`)
                );
            }
            console.warn(`Ein unerwarteter Fehler ist aufgetreten. Für mehr Infos suche in der /errors.log nach der Error-ID: ${uuid}`);
            fs.writeFileSync(path.join(__dirname, '../../errors.log'), `
Error-ID: ${uuid}
Time: ${new Date().toString()}
Request-Body: ${req.body ? JSON.stringify(req.body) : "Doesn't exist here."}
Request-Query: ${req.query ? JSON.stringify(req.query) : "Doesn't exist here."}
Request-Path: ${req.path}
Request-Method: ${req.method}
Error-Message as JSON: ${JSON.stringify((e as Error).message)}
Error-Message: ${(e as Error).message}
Error-Stack: ${(e as Error).stack}
Error-Name: ${(e as Error).name}
Error as JSON: ${JSON.stringify(e as Error)}
Error: ${(e as Error).toString()}\n`
            , { flag: "a"});
        }
    }
}