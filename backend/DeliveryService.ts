import { Request, Response } from "express";
import path from "path";

/* 17.04.2026, Tim + Lia, Die Klasse DeliveryService stellt die einzelnen HTML Seiten für den User zur Verfügung */
export class DeliveryService {
    
    /* 17.04.2026, Tim + Lia, Die Paths sind die einzelnen Pfade zu den HTML Seiten, damit der DS diese abrufen und dem User zur Verfügung stellen kann */
    private paths: String[] = ["login", "home", "ranking", "baureihen"];

    /* 17.04.2026, Tim + Lia, Der Konstruktor meldet eine Listener bei app an um dann die HTML Seiten bereitzustellen*/
    constructor(app: any) {
        for(const urlpath of this.paths) {
            app.get(`/${urlpath}`, (req: Request, res: Response) => {
                res.sendFile(path.join(__dirname, `../frontend/seiten/${urlpath}/index.html`));
            });
        }
    }
}