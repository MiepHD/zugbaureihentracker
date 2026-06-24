import { expect, test, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { DeliveryService } from '../../backend/DeliveryService.js';
import express, { Express } from "express";

//Werk von Lia

const paths: string[] = ["login", "registrieren"];
const paths2: string[] = ["", "home", "suchergebnis"];

beforeAll(async () => {
    const app: Express = express();
    app.listen(3001);
    new DeliveryService(app);
});

for (const path of paths) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const statusCode = await new Promise<number>((resolve, reject) => {
            http.get(`http://localhost:3001/${path}/`, (res) => {
                resolve(res.statusCode || 0);
            }).on('error', reject);
        });

        expect(statusCode).toBe(200);
    });
}

for (const path of paths2) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const statusCode = await new Promise<number>((resolve, reject) => {
            http.get(`http://localhost:3001/${path}/`, (res) => {
                resolve(res.statusCode || 0);
            }).on('error', reject);
        });

        expect(statusCode).toBe(302);
    });
}