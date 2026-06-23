import { Sequelize } from "sequelize";
import { Database } from "./Database";
import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";

export class API {
    private adminpasswort: string;
    /**
     * Konstruktor der API; sendet Requests von vom Frontend aufgerufene Methoden an den Server und schickt die Antwort wieder zurück.
     * @author Tim
     * @param sequelize 
     * @param app 
     */
    constructor(sequelize: Sequelize, app: Express) {
        try {
            this.adminpasswort = fs.readFileSync(path.join(__dirname, 'config/pass.txt'), 'utf8');
        } catch {
            this.adminpasswort = "Das Adminpasswort";
        }
        console.log("Das Adminpasswort ist: " + this.adminpasswort);
        const db = new Database(sequelize);

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cookieParser());

        app.get("/logout", express.json(), async (req: Request, res: Response) => {
            res.clearCookie("sessiontoken", {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            res.redirect("/login");
        });

        /**
         * Lia
         * Gibt die Request, eine Baureihe als gefunden zu markieren an die Datenbank weiter und je nach Anwort Redirected entweder auf die Home Seite oder auf die Suchergebnis Seite.
         */
        app.post("/api/baureiheAlsGefundenMarkieren", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            if(await db.baureiheAlsGefundenMarkieren(sessiontoken, data.ubid)) {
                res.redirect("/home");
            } else {
                res.redirect(`/suchergebnis?ubid=${data.ubid}`);
            }
        });

        app.post("/api/addInviteCode", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            if (data.passwort !== this.adminpasswort) {res.status(401); res.send(); return; }
            const success = await db.addinvitecode(data.code as string);
            if (success) {
                res.redirect("/invite");
            } else {
                res.send("Error");
            }
        });

        /**
         * Lia
         * Gibt die Request die Information zu einer Baureihe zu bekommen an die Datenbank weiter
         */
        app.get("/api/getBaureihe", express.json(), async (req: Request, res: Response) => {
            const data = req.query;
            res.send(`${JSON.stringify(await db.getBaureihe(data.ubid as string))}`);
        });

        /**
         * Lia
         * Gibt die Anfrage des Servers, eine Registrierung durchzuführen an die Datenbank weiter, damit diese einen neuen Nutzer speichern kann. Bei Erfolg Weiterleitung zur Login Seite, sonst auf Registrieren Seite bleiben.
         */
        app.post("/api/registrieren", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            if (data.username == "" || data.passwort == "" || data.code == "") {res.redirect("/registrieren"); return;}
            const success = await db.registrieren(data.username, await this.sha256Hex(data.passwort), data.code);
            if (success) {
                res.redirect("/login");
            } else {
                res.redirect("/registrieren");
            }
        });

        /**
         * Lia
         * Gibt die des Servers einen Login durchzuführen an die Datenbank weiter 
         */
        app.post("/api/anmelden", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            console.log(`${data.username}${data.passwort}`);
            if (data.username == "" || data.passwort == "") {res.redirect("/login"); return;}
            const sessiontoken = await db.anmelden(data.username, await this.sha256Hex(data.passwort));
            if (!sessiontoken) {res.redirect("/login"); return;}
            res.cookie("sessiontoken", sessiontoken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            res.redirect("/home");
        });
        
        app.post("/api/fuegeFreundHinzu", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            try {
                const success = await db.fuegeFreundHinzu(sessiontoken, data.uuid);
                if (success) {
                    res.redirect("/freunde");
                } else {
                    res.send(`{ "success": ${success}`);
                }
            } catch (e: any) {
                res.send((e as Error).message);
            }
            
        });

        app.post("/api/entferneFreund", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            try {
                const success = await db.entferneFreund(sessiontoken, data.uuid);
                if (success) {
                    res.redirect("/freunde");
                } else {
                    res.send(`{ "success": ${success}`);
                }
            } catch (e: any) {
                res.send((e as Error).message);
            }
        });

        app.get("/api/baureihenVonFreundenAbrufen", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            let data: any = await db.baureihenVonFreundenAbrufen(sessiontoken);
            if (data && data.Freunde) data = data.Freunde;
            res.send(`${JSON.stringify(data)}`);
        })

        app.get("/api/getGefundeneBaureihen", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            res.send(`${JSON.stringify(await db.getGefundeneBaureihen(sessiontoken))}`);
        });

        app.get("/api/getGesamtzahlBaureihen", express.json(), async (req: Request, res: Response) => {
            res.send(`${await db.getGesamtzahlBaureihen()}`);
        });

        app.post("/api/addBaureihe", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            if (data.passwort !== this.adminpasswort) {res.status(401); res.send(); return; }
            const success = await db.addBaureihe(data.ubid, data.name, data.beschreibung);
            if (success == true) {
                res.redirect("/add");
            } else {
                res.send(`{ "success": ${success}}`);
            }
            
        });

        app.get("/api/getUUID", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            res.send(await db.getUUID(sessiontoken));
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
}