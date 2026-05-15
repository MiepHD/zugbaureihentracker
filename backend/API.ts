import { Sequelize } from "sequelize";
import { Database } from "./Database";
import { Response } from "express";

export class API {
    constructor(sequelize: Sequelize, app: any) {
        const db = new Database(sequelize);
        const interactions = [
            {
                "id": "bagm",
                "method": "post",
                "function": db.baureiheAlsGefundenMarkieren,
            },
            {
                "id": "gb",
                "method": "get",
                "function": db.getBaureihe,
            }
        ];

        for (const i of interactions) {
            if (i.method === "get") {
                app.get(`/api/${i.id}`, async (req: Request, res: Response) => {
                    await req.text();
                    res.send();
                });
            }
        }
    }
}