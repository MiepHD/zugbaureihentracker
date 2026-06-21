import express, { Express } from "express";
import { DeliveryService } from "./DeliveryService";
import { API } from "./API";
import { Sequelize } from "sequelize";

export class Server {

    private app: Express = express();
    private static PORT: number = 3000;

    /**
     * Konstruktor für den Server; Starten des Servers; Übergeben des Delivery Service
     * @author Tim & Lia
     * @since 14.04.2026
     */
    constructor() {
        this.app.listen(Server.PORT, () => {
            console.log(`Server läuft auf http://localhost:${Server.PORT}`);
        });
        const ds: DeliveryService = new DeliveryService(this.app);
        const api: API = new API(new Sequelize(
            'appdb',
            'appuser',
            'secret123',
            {
                host: 'localhost',
                port: 3306,
                dialect: 'mariadb',
                dialectOptions: {
                    connectTimeout: 1000,
                },
            }
        ), this.app);
    }

}

new Server();