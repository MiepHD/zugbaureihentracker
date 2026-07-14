import { Request, Response } from "express";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { API } from "./API";
import { Nutzer } from "./models/Nutzer";
import { ForbiddenError } from "./error/ForbiddenError";

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

    /**
     * Der Konstruktor meldet eine Listener bei app an um dann die HTML Seiten bereitzustellen
     * @since 17.04.2026
     * @author Tim & Lia 
     * @param app 
     */
    constructor(app: Express) {
        app.use(cookieParser());
        app.get(["/admin{*any}", "/admin"], this.adminAccess.bind(this));
        app.get(["/app/{*any}", "/app", "/", ""], this.restrictedAccess.bind(this));
        app.use(express.static(path.join(__dirname, '../frontend')));
    }

    private async adminAccess(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("site");
            res.sendFile(path.join(__dirname, `../frontend/${req.path}`));
        });
    }

    private async restrictedAccess(req: Request, res: Response) {
        let urlpath = req.path;
        if (urlpath.replaceAll("/", "") === "") urlpath = "app/home/index.html";
        await API.try(req, res, true, async () => {
            res.sendFile(path.join(__dirname, `../frontend/${urlpath}`));
        });
    }
}