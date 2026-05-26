import express, { Express } from "express";
import { DeliveryService } from "./DeliveryService";

export class Server {

    private app: Express = express();
    private PORT: number = 3000;

    /**
     * Konstruktor für den Server; Starten des Servers; Übergeben des Delivery Service
     * @author Tim & Lia
     * @since 14.04.2026
     */
    constructor() {
        this.app.listen(this.PORT, () => {
            console.log(`Server läuft auf http://localhost:${this.PORT}`);
        });
        const ds: DeliveryService = new DeliveryService(this.app);
    }

}

new Server();