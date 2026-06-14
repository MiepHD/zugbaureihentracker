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

        app.post("/api/baureiheAlsGefundenMarkieren", express.json(), async (req: Request, res: Response) => {
            const sessiontoken = req.cookies.sessiontoken;
            if (sessiontoken == undefined) {res.status(401); res.send(); return; }
            const data = req.body;
            res.send(`{ success: ${await db.baureiheAlsGefundenMarkieren(sessiontoken, data.ubid)}}`);
        });

        app.get("/api/getBaureihe", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            res.send(`{ Baureihe: ${JSON.stringify(await db.getBaureihe(data.ubid))}}`);
        });

        //Lia
        app.post("/api/registrieren", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            const success = await db.registrieren(data.username, data.passwort);
            if (success) {
                res.sendFile(path.join(__dirname, `../frontend/login/index.html`));
            } else {
                res.sendFile(path.join(__dirname, `../frontend/registrieren/index.html`));
            }
        });

        //Lia
        app.post("/api/anmelden", express.json(), async (req: Request, res: Response) => {
            const data = req.body;
            console.log(`${data.username}${data.passwort}`);
            const sessiontoken = await db.anmelden(data.username, data.passwort);
            if (!sessiontoken) {res.sendFile(path.join(__dirname, `../frontend/login/index.html`)); return;}
            res.cookie("sessiontoken", sessiontoken, {
                httpOnly: true,
                sameSite: "lax",
                secure: false
            });
            res.sendFile(path.join(__dirname, `../frontend/home/index.html`));
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
            const data = req.body;
            res.send(`{ success: ${await db.getGesamtzahlBaureihen()}}`);
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