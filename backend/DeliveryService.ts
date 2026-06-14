import { Request, Response } from "express";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import path from "path";

/**
 * Die Klasse DeliveryService stellt die einzelnen HTML Seiten für den User zur Verfügung
 * @since 17.04.2026
 * @author Tim & Lia 
 */
export class DeliveryService {
    /**
     * Die Paths sind die einzelnen Pfade zu den HTML Seiten, damit der DS diese abrufen und dem User zur Verfügung stellen kann
     * @since 17.04.2026
     * @author Tim & Lia, 
     */
    private paths: String[] = ["", "home", "suchergebnis"];

    /**
     * Der Konstruktor meldet eine Listener bei app an um dann die HTML Seiten bereitzustellen
     * @since 17.04.2026
     * @author Tim & Lia 
     * @param app 
     */
    constructor(app: Express) {
        app.use(cookieParser());
        for(let urlpath of this.paths) {
            app.get(`/${urlpath}`, (req: Request, res: Response) => {
                if (req.path === "/") urlpath = "home";

                const sessiontoken = req.cookies?.sessiontoken;
                if (sessiontoken == undefined) { urlpath = "login" }
                
                res.sendFile(path.join(__dirname, `../frontend/${urlpath}/index.html`));
            });
        }
        app.use(express.static(path.join(__dirname, '../frontend')));
    }
}