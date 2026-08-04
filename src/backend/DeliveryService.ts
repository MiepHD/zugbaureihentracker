import { NextFunction, Request, Response } from "express";
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
        app.use(express.static(path.join(__dirname, '../pages')));
        app.use((req, res) => {
            this.errorHandler(req, res, null, { code: "ENOENT"} as NodeJS.ErrnoException);
        });
    }

    private async adminAccess(req: Request, res: Response, next: NextFunction) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("site");
            res.sendFile(path.join(__dirname, `../pages/${req.path}`), (err) => {this.errorHandler(req, res, next, err)});
        });
    }

    private async restrictedAccess(req: Request, res: Response, next: NextFunction) {
        let urlpath = req.path;
        if (urlpath.replaceAll("/", "") === "") {res.redirect("/app/home"); return;}
        await API.try(req, res, true, async () => {
            res.sendFile(path.join(__dirname, `../pages/${urlpath}`), (err) => {this.errorHandler(req, res, next, err)});
        });
    }

    private async errorHandler(req: Request, res: Response, next: NextFunction | null, err: NodeJS.ErrnoException) {
        if (err) {
            // Spezieller Fall: Datei oder Pfad existiert nicht (ENOENT)
            if (err.code === 'ENOENT') {
                return res.status(404).redirect("/public/404");
            }

            // Falls der Client den Download vorzeitig abbricht
            if (err.code === 'ECONNABORTED') {
                return;
            }

            if (err.code === 'EISDIR') {
                const redirectUrl = req.originalUrl.endsWith('/') 
                ? req.originalUrl 
                : `${req.originalUrl}/`;
                
                return res.redirect(301, redirectUrl);
            }

            // Alle anderen Fehler (z.B. fehlende Dateirechte/EACCES) an den globalen Error-Handler weiterleiten
            if (next) next(err);
        }
    }
}