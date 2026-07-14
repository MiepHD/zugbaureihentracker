import { expect, test, beforeAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';
import express, { Express } from "express";
import request from 'supertest';

import { API } from "../../backend/API";
import { DeliveryService } from "../../backend/DeliveryService";

const publicpaths: string[] = ["public/login", "public/registrieren", "public/invite"];
const restricted: string[] = ["", "app/elevate", "app/freunde", "app/freundschaftsanfragen", "app/home", "app/leaderboard", "app/suchergebnis", "app/user"];
const admin: string[] = ["admin/accounts", "admin/add", "admin/addmany", "admin/baureihen", "admin/dashboard", "admin/editor"];

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

for (const path of publicpaths) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(200);
    });
}

for (const path of restricted) {
    test(`Server responds to "${path}" directory with 302 Redirected`, async () => {
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}

for (const path of admin) {
    test(`Server responds to "${path}" directory with 302 Redirected`, async () => {
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}



async function createInviteCode(code = "X") {
    await request(app).post("/api/registrierungscodes/json/addInviteCode").send({ code, passwort: "Das Adminpasswort" });
}

async function registerAndLogin(username: string) {
    await createInviteCode();
    await request(app).post("/api/nutzer/json/registrieren").send({ username, passwort: username, code: "X" });
    const login = await request(app).post("/api/nutzer/json/anmelden").send({ username, passwort: username });
    return login.headers["set-cookie"];
}

async function loginAsAdmin(username: string) {
    const cookie = await registerAndLogin(username);
    await request(app).post("/api/nutzer/json/elevate").set("Cookie", cookie).send({ passwort: "Das Adminpasswort" });
    return cookie;
}

for (const path of admin) {
    test(`Server responds to "${path}" directory with 200 OK when being logged in as an admin`, async () => {
        const cookie = await loginAsAdmin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}

for (const path of restricted) {
    test(`Server responds to "${path}" directory with 200 OK when being logged in as an admin`, async () => {
        const cookie = await loginAsAdmin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}

for (const path of publicpaths) {
    test(`Server responds to "${path}" directory with 200 OK when being logged in as an admin`, async () => {
        const cookie = await loginAsAdmin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(200);
    });
}



for (const path of publicpaths) {
    test(`Server responds to "${path}" directory with 200 OK when being logged in as a user`, async () => {
        const cookie = await registerAndLogin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(200);
    });
}

for (const path of restricted) {
    test(`Server responds to "${path}" directory with 200 OK when being logged in as a user`, async () => {
        const cookie = await registerAndLogin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}

for (const path of admin) {
    test(`Server responds to "${path}" directory with 302 Redirected when being logged in as a user`, async () => {
        const cookie = await registerAndLogin("F");
        const response = await request(app).get(`/${path}/`);
        expect(response.statusCode).toBe(302);
    });
}