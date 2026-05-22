import { Sequelize } from "sequelize";
import { Database } from "./Database";
import express, { Request, Response, Express } from "express";

export class API {
    constructor(sequelize: Sequelize, app: Express) {
        const db = new Database(sequelize);

        app.post("/api/baureiheAlsGefundenMarkieren", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ success: ${await db.baureiheAlsGefundenMarkieren(data.sessiontoken, data.ubid)}}`);
        });

        app.post("/api/getBaureihe", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ Baureihe: ${JSON.stringify(await db.getBaureihe(data.ubid))}}`);
        });

        app.post("/api/registrieren", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ success: ${await db.registrieren(data.name, data.passworthash)}}`);
        });

        app.post("/api/anmelden", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ sessiontoken: ${await db.anmelden(data.name, data.passworthash)}}`);
        });
        
        app.post("/api/fuegeFreundHinzu", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ success: ${await db.fuegeFreundHinzu(data.uuid, data.sessiontoken)}}`);
        });

        app.post("/api/entferneFreund", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ success: ${await db.entferneFreund(data.name, data.passworthash)}}`);
        });

        app.post("/api/getGefundeneBaureihen", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ Baureihe: ${await db.getGefundeneBaureihen(data.name)}}`);
        });

        app.post("/api/getGesamtzahlBaureihen", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ success: ${await db.getGesamtzahlBaureihen()}}`);
        });

        app.post("/api/getUUID", express.json(), async (req: Request, res: Response) => {
            const data = JSON.parse(await req.body);
            res.send(`{ uuid: ${await db.getUUID(data.sessiontoken)}}`);
        });
    }
}