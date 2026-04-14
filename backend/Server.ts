import express, { Request, Response } from "express";

class Server {

    private app: any = express();
    private PORT: number = 3000;

    Server() {
        this.app.get("/", (req: Request, res: Response) => {
            res.send("Hello World mit TypeScript!");
        });

        this.app.listen(this.PORT, () => {
            console.log(`Server läuft auf http://localhost:${this.PORT}`);
        });
    }

}

new Server();