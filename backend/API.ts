import { Sequelize } from "sequelize";
import { Database } from "./Database";
import express, { Request, Response, Express } from "express";
import cookieParser from "cookie-parser";
import path from "path";

export class API {
    /**
     * 
     * @author Tim
     * @param sequelize 
     * @param app 
     */
    constructor(sequelize: Sequelize, app: Express) {
        const db = new Database(sequelize);

        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cookieParser());

        //Lia
        app.post("/api/baureiheAlsGefundenMarkieren", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            if(await db.baureiheAlsGefundenMarkieren(sessiontoken, data.ubid)) {
                res.redirect("/home");
            } else {
                res.redirect("/suchergebnis");
            }
        });

        app.get("/api/getBaureihe", express.json(), async (req: Request, res: Response) => {
            const data = req.query;
            res.send(`${JSON.stringify(await db.getBaureihe(data.ubid as string))}`);
        });

        //Lia
        app.post("/api/registrieren", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            const success = await db.registrieren(data.username, data.passwort);
            if (success) {
                res.redirect("/login");
            } else {
                res.redirect("/registrieren");
            }
        });

        //Lia
        app.post("/api/anmelden", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            console.log(`${data.username}${data.passwort}`);
            const sessiontoken = await db.anmelden(data.username, data.passwort);
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
            res.send(`{ success: ${await db.fuegeFreundHinzu(sessiontoken, data.uuid)}}`);
        });

        app.delete("/api/entferneFreund", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            res.send(`{ success: ${await db.entferneFreund(sessiontoken, data.uuid)}}`);
        });

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
            if (data.passwort !== "Das Adminpasswort") {res.status(401); res.send(); return; }
            res.send(`{ success: ${await db.addBaureihe(data.ubid, data.name, data.beschreibung)}}`);
        });

        app.get("/api/getUUID", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            res.send(`{ uuid: ${await db.getUUID(sessiontoken)}}`);
        });
    }
}