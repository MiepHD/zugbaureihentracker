import { Sequelize } from "sequelize";
import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";

import { Database } from "./Database";

import { Baureihe } from "./api/Baureihe";
import { Freundesliste } from "./api/Freundesliste";
import { Nutzer } from "./api/Nutzer";
import { Aktivitaet } from "./api/Aktivitaet";
import { Registrierungscodes } from "./api/Registierungscodes";

import { ExpectedError } from "./error/ExpectedError";
import { randomUUID } from "crypto";
import { UnauthorizedError } from "./error/UnauthorizedError";
import { ForbiddenError } from "./error/ForbiddenError";

export class API {
    private adminpasswort: string;
    static db: Database;
    static checkSessiontoken: typeof Nutzer.checkSessiontoken = Nutzer.checkSessiontoken;

    constructor(sequelize: Sequelize, adminpasswort: string | null) {
        if (adminpasswort) {
            this.adminpasswort = adminpasswort;
        } else {
            try {
                this.adminpasswort = fs.readFileSync(path.join(__dirname, 'config/pass.txt'), 'utf8').replace("\n", "");
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

    private async bindListeners(app: Express) {
        const nutzer = new Nutzer();
        app.get("/api/nutzer/web/logout", nutzer.logout.bind(nutzer));
        app.post("/api/nutzer/json/registrieren", nutzer.registrieren.bind(nutzer));
        app.post("/api/nutzer/json/anmelden", nutzer.anmelden.bind(nutzer));
        app.get("/api/nutzer/raw/getUUID", nutzer.getUUID.bind(nutzer));
        app.get("/api/nutzer/json/getAccounts", nutzer.getAll.bind(nutzer));
        app.post("/api/nutzer/json/removeAccount", nutzer.remove.bind(nutzer));
        app.get("/api/nutzer/json/isElevated", nutzer.isElevated.bind(nutzer));
        app.get("/api/nutzer/raw/getNutzername", nutzer.getNutzername.bind(nutzer));
        app.post("/api/nutzer/json/removeAdmin", (req: Request, res: Response) => {
            if (this.authorize(req, res, "accounts")) nutzer.removeAdmin(req, res);
        });
        app.post("/api/nutzer/json/addAdmin", (req: Request, res: Response) => {
            if (this.authorize(req, res, "accounts")) nutzer.elevateByUUID(req, res);
        });
        app.post("/api/nutzer/json/elevate", (req: Request, res: Response) => {
            if (this.authorize(req, res, "elevate")) nutzer.elevate(req, res);
        });

        const registrierungscodes = new Registrierungscodes();
        app.post("/api/registrierungscodes/json/addInviteCode", (req: Request, res: Response) => {
            registrierungscodes.add(req, res, req.body.passwort == this.adminpasswort)
        });

        const baureihe = new Baureihe();
        app.get("/api/baureihe/json/get", baureihe.get.bind(baureihe));
        app.get("/api/baureihe/json/getall", baureihe.getAll.bind(baureihe));
        app.get("/api/baureihe/raw/count", baureihe.count.bind(baureihe));
        app.post("/api/baureihe/json/add", baureihe.add.bind(baureihe));
        app.post("/api/baureihe/json/remove", baureihe.remove.bind(baureihe));
        app.post("/api/baureihe/json/edit", baureihe.edit.bind(baureihe));

        const aktivitaet = new Aktivitaet();
        app.post("/api/aktivitaet/json/setgefunden", aktivitaet.alsGefundenMarkieren.bind(aktivitaet));
        app.post("/api/aktivitaet/json/setnichtgefunden", aktivitaet.alsNichtGefundenMarkieren.bind(aktivitaet));
        app.post("/api/aktivitaet/json/setgefahren", aktivitaet.alsGefahrenMarkieren.bind(aktivitaet));
        app.post("/api/aktivitaet/json/setnichtgefahren", aktivitaet.alsNichtGefahrenMarkieren.bind(aktivitaet));
        app.get("/api/aktivitaet/json/getgefunden", aktivitaet.getGefundene.bind(aktivitaet));

        const freundesliste = new Freundesliste();
        app.post("/api/freundesliste/json/add", freundesliste.add.bind(freundesliste));
        app.post("/api/freundesliste/json/remove", freundesliste.remove.bind(freundesliste));
        app.get("/api/freundesliste/json/baureihenvonfreundenabrufen", freundesliste.baureihenVonFreundenAbrufen.bind(freundesliste));
        app.get("/api/freundesliste/json/getranking", freundesliste.getRanking.bind(freundesliste));
        app.post("/api/freundesliste/json/akzeptiereanfrage", freundesliste.akzeptiereFreundschaftsanfrage.bind(freundesliste));
        app.post("/api/freundesliste/json/abortanfrage", freundesliste.abortFreundschaftsanfrage.bind(freundesliste));
        app.post("/api/freundesliste/json/ablehnenanfrage", freundesliste.FreundschaftsanfrageAblehnen.bind(freundesliste));
        app.get("/api/freundesliste/json/getausstehend", freundesliste.getAusstehendeFreundschaftsanfragen.bind(freundesliste));
    }

    private authorize(req: Request, res: Response, redirect: string) {
        if (req.body.passwort !== this.adminpasswort) {
            console.warn(`Jemand hat ein falsches Masterpasswort auf /${redirect} eingegeben.`);
            res.send(`{ "errorMessage": "403: Das Passwort ist falsch." }`);
            return false;
        }
        return true;
    }

    static isValidString(str: unknown): boolean {
        return str !== null && typeof str === "string" && str !== ""
    }

    static isValidUUID(uuid: unknown): boolean {
        if (!this.isValidString(uuid)) return false;
        return (uuid as string).length === 36;
    }

    /**
     * @param checkSessiontoken Ob das Sessiontoken überprüft wird. Bei false kommt bei execute als sessiontoken null
     * @param redirectOnError Beginnt ohne / und endet mit & oder ?. Alternativ kann man auch false übergeben, dass kein redirect ausgeführt wird
     * @param execute Bekommt die Daten übergeben und ein Sessiontoken falls eines angefordert wurde
     */
    static async try(req: Request, res: Response, checkSessiontoken: boolean, execute: (data: any, sessiontoken: string | null) => Promise<void>) {
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
            if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
                res.status(e.statuscode);
                res.redirect(
                    `${e instanceof UnauthorizedError ? "/public/login" : "/app/home"}?errorMessage=${
                        encodeURIComponent(`${e.statuscode}: ${(e as Error).message}`)
                    }`
                );
                return;
            } else if (e instanceof ExpectedError) {
                res.status(e.statuscode);
                res.send(`{ "errorMessage": "${e.statuscode}: ${(e as Error).message}" }`);
                return;
            }
            const uuid = randomUUID();
            res.status(500);
            res.send(`{ "errorMessage": "500: Es ist ein unerwarteter Fehler auf dem Server aufgetreten. (${uuid})" }`);
            console.warn(`Ein unerwarteter Fehler ist aufgetreten. Für mehr Infos suche in der /errors.log nach der Error-ID: ${uuid}`);
            fs.writeFileSync(path.join(__dirname, '../errors.log'), `
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