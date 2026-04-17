import express, { Request, Response } from "express";
import { DeliveryService } from "./DeliveryService";

class Server {

    private app: any = express();
    private PORT: number = 3000;

    constructor() {
        this.app.listen(this.PORT, () => {
            console.log(`Server läuft auf http://localhost:${this.PORT}`);
        });
        const ds: DeliveryService = new DeliveryService(this.app);
    }

}

new Server();