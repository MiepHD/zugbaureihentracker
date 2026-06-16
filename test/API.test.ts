import { Sequelize } from "sequelize";
import express, { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { API } from "../backend/API";

let app: Express;
let sequelize: Sequelize;

beforeAll(async () => {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: ":memory:",
        logging: false,
    });

    app = express();
    new API(sequelize, app);

    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    await sequelize.truncate({
        cascade: true,
        restartIdentity: true
    });
});


test("Baureihe hinzufügen API", async () => {
    const response = await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "ab",
            name: "bb",
            beschreibung: "cb",
            passwort: "Das Adminpasswort"
        });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.text).success).toBe(true);
});


test("Baureihe abfragen API", async () => {
    await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "a",
            name: "b",
            beschreibung: "c",
            passwort: "Das Adminpasswort"
        });

    const response = await request(app)
        .get("/api/getBaureihe")
        .query({
            ubid: "a"
        });

    expect(response.status).toBe(200);

    const baureihe = JSON.parse(response.text);

    expect(baureihe.ubid).toBe("a");
    expect(baureihe.name).toBe("b");
    expect(baureihe.beschreibung).toBe("c");
});


test("Gesamtzahl Baureihen API", async () => {
    await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "a",
            name: "b",
            beschreibung: "c",
            passwort: "Das Adminpasswort"
        });

    const response = await request(app)
        .get("/api/getGesamtzahlBaureihen");

    expect(response.text).toBe("1");
});


test("Account registrieren API", async () => {
    const response = await request(app)
        .post("/api/registrieren")
        .send({
            username: "abc",
            passwort: "abc"
        });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
});


test("Account anmelden API", async () => {
    await request(app)
        .post("/api/registrieren")
        .send({
            username: "def",
            passwort: "def"
        });

    const response = await request(app)
        .post("/api/anmelden")
        .send({
            username: "def",
            passwort: "def"
        });

    expect(response.status).toBe(302);
    expect(response.headers["set-cookie"]).toBeDefined();
});


test("Baureihe als gefunden markieren API", async () => {
    await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "a",
            name: "b",
            beschreibung: "c",
            passwort: "Das Adminpasswort"
        });

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "A",
            passwort: "A"
        });

    const login = await request(app)
        .post("/api/anmelden")
        .send({
            username: "A",
            passwort: "A"
        });

    const cookie = login.headers["set-cookie"];

    const response = await request(app)
        .post("/api/baureiheAlsGefundenMarkieren")
        .set("Cookie", cookie)
        .send({
            ubid: "a"
        });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/home");
});


test("Gefundene Baureihen API", async () => {
    await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "a",
            name: "b",
            beschreibung: "c",
            passwort: "Das Adminpasswort"
        });

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "F",
            passwort: "F"
        });

    const login = await request(app)
        .post("/api/anmelden")
        .send({
            username: "F",
            passwort: "F"
        });

    const cookie = login.headers["set-cookie"];

    await request(app)
        .post("/api/baureiheAlsGefundenMarkieren")
        .set("Cookie", cookie)
        .send({
            ubid: "a"
        });

    const response = await request(app)
        .get("/api/getGefundeneBaureihen")
        .set("Cookie", cookie);

    expect(response.status).toBe(200);

    const baureihen = JSON.parse(response.text);

    expect(baureihen[0].ubid).toBe("a");
});


test("Freund hinzufügen API", async () => {
    await request(app)
        .post("/api/registrieren")
        .send({
            username: "A",
            passwort: "A"
        });

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "B",
            passwort: "B"
        });

    const loginA = await request(app)
        .post("/api/anmelden")
        .send({
            username: "A",
            passwort: "A"
        });

    const loginB = await request(app)
        .post("/api/anmelden")
        .send({
            username: "B",
            passwort: "B"
        });

    const cookieA = loginA.headers["set-cookie"];
    const cookieB = loginB.headers["set-cookie"];

    const uuidResponse = await request(app)
        .get("/api/getUUID")
        .set("Cookie", cookieB);

    const uuid = JSON.parse(uuidResponse.text).uuid;

    const response = await request(app)
        .post("/api/fuegeFreundHinzu")
        .set("Cookie", cookieA)
        .send({
            uuid
        });

    expect(response.text).toContain("true");
});

test("getUUID API", async () => {
    await request(app)
        .post("/api/registrieren")
        .send({
            username: "G",
            passwort: "G"
        });

    const login = await request(app)
        .post("/api/anmelden")
        .send({
            username: "G",
            passwort: "G"
        });

    const cookie = login.headers["set-cookie"];

    const response = await request(app)
        .get("/api/getUUID")
        .set("Cookie", cookie);

    expect(response.status).toBe(200);

    const data = JSON.parse(response.text);

    expect(data.uuid).toBeTypeOf("string");
});

test("Freund entfernen API", async () => {
    // Nutzer D registrieren
    await request(app)
        .post("/api/registrieren")
        .send({
            username: "D",
            passwort: "D"
        });

    // Nutzer E registrieren
    await request(app)
        .post("/api/registrieren")
        .send({
            username: "E",
            passwort: "E"
        });


    // D anmelden
    const loginD = await request(app)
        .post("/api/anmelden")
        .send({
            username: "D",
            passwort: "D"
        });

    const cookieD = loginD.headers["set-cookie"];


    // E anmelden, um UUID zu bekommen
    const loginE = await request(app)
        .post("/api/anmelden")
        .send({
            username: "E",
            passwort: "E"
        });

    const cookieE = loginE.headers["set-cookie"];


    // UUID von E holen
    const uuidResponse = await request(app)
        .get("/api/getUUID")
        .set("Cookie", cookieE);

    const uuidE = JSON.parse(uuidResponse.text).uuid;


    // Freund hinzufügen
    const addResponse = await request(app)
        .post("/api/fuegeFreundHinzu")
        .set("Cookie", cookieD)
        .send({
            uuid: uuidE
        });

    expect(addResponse.text).toContain("true");


    // Freund entfernen
    const removeResponse = await request(app)
        .delete("/api/entferneFreund")
        .set("Cookie", cookieD)
        .send({
            uuid: uuidE
        });

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.text).toContain("true");
});