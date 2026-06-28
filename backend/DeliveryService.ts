import { Request, Response } from "express";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { API } from "./api/API";
import { Nutzer } from "./models/Nutzer";

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
    private paths: String[] = ["", "accounts", "add", "addmany", "admin", "baureihen", "elevate", "freunde", "home", "suchergebnis", "editor"];

    private restricted: String[] = ["accounts", "add", "addmany", "admin", "baureihen", "editor"];


    /**
     * Der Konstruktor meldet eine Listener bei app an um dann die HTML Seiten bereitzustellen
     * @since 17.04.2026
     * @author Tim & Lia 
     * @param app 
     */
    constructor(app: Express) {
        app.use(cookieParser());
        for(let urlpath of this.paths) {
            app.get(`/${urlpath}`, this.handleRequest.bind(this));
        }
        app.use(express.static(path.join(__dirname, '../frontend')));
    }

    private async handleRequest(req: Request, res: Response) {
        let urlpath = req.path;
        if (urlpath === "/") urlpath = "home";
        const sessiontoken = await API.checkSessiontoken(req, res);
        if (sessiontoken == null) return;
        if (this.restricted.includes(urlpath.replace("/", "")) && !await Nutzer.isElevated(sessiontoken)) {
            res.redirect("/home?errorMessage=" + encodeURIComponent("Keine Berechtigung diese Seite aufzurufen."));
        }
        res.sendFile(path.join(__dirname, `../frontend/${urlpath}/index.html`));
    }
}