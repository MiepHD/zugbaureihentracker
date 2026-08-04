import express, { Express } from "express";
import { Sequelize } from "sequelize";
import fs from "fs";
import http from 'http';
import https from 'https';
import path from "path";

import { DeliveryService } from "./DeliveryService";

import { API } from "./API";

export class Server {
    private api: API;
    private app: Express;

    /**
     * Konstruktor für den Server; Starten des Servers; Übergeben des Delivery Service
     * @author Tim & Lia
     * @since 14.04.2026
     */
    constructor() {
        this.app = express();
        try {
            const privateKey  = fs.readFileSync(path.join(__dirname, 'sslcert/privkey.pem'), 'utf8');
            const certificate = fs.readFileSync(path.join(__dirname, 'sslcert/fullchain.pem'), 'utf8');
            const credentials = {key: privateKey, cert: certificate};
            const httpServer = http.createServer(this.app);
            const httpsServer = https.createServer(credentials, this.app);

            httpServer.listen(80);
            httpsServer.listen(443);
            console.log(`Server läuft auf http://localhost:80 & https://localhost:433`);
        } catch (e) {
            console.warn("SSL Verbindung konnte nicht hergestellt werden. Fallback auf Port 3000");
            this.app.listen(3000, () => {
                console.log(`Server läuft auf http://localhost:3000`);
            });
        }
        this.api = new API(new Sequelize(
            'appdb',
            'appuser',
            'secret123',
            {
                host: 'localhost',
                port: 3306,
                dialect: 'mariadb',
                logging: false,
                dialectOptions: {
                    connectTimeout: 1000,
                    sessionVariables: {
                        FOREIGN_KEY_CHECKS: 0
                    }
                },
            }
        ), null);
    }
    async init(): Promise<void> {
        await this.api.init(this.app);
        new DeliveryService(this.app);
    }

}

new Server().init();
