import { Request, Response } from "express";
import path from "path";

export class DeliveryService {
    
    private paths: String[] = ["login", "home", "ranking", "baureihen"];

    constructor(app: any) {
        for(const urlpath of this.paths) {
            app.get(`/${urlpath}`, (req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, `../frontend/seiten/${urlpath}/index.html`));
            });
        }
    }
}