import { expect, test, beforeAll, beforeEach } from 'vitest';
import http from 'http';
import { Sequelize } from 'sequelize';
import express, { Express } from "express";
import request from 'supertest';

import { API } from "../../backend/api/API";
import { DeliveryService } from "../../backend/DeliveryService";

//Werk von Lia

const paths: string[] = ["login", "registrieren"];
const paths2: string[] = ["", "home", "suchergebnis"];

let sequelize: Sequelize;
let app: Express;

beforeAll(async () => {
    sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
    app = express();
    await new API(sequelize, "Das Adminpasswort").init(app);
    await sequelize.sync({ force: true });
    new DeliveryService(app);
});

beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
});

for (const path of paths) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(200);
    });
}

for (const path of paths2) {
    test(`Server responds to "${path}" directory with 302 Redirected`, async () => {
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}