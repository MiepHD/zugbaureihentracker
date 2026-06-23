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

async function createInviteCode() {
    await request(app)
        .post("/api/addInviteCode")
        .send({
            code: "X",
            passwort: "Das Adminpasswort"
        });
}

test("Logout API", async () => {
    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "LogoutUser",
            passwort: "LogoutUser",
            code: "X"
        });

    const login = await request(app)
        .post("/api/anmelden")
        .send({
            username: "LogoutUser",
            passwort: "LogoutUser"
        });

    const cookie = login.headers["set-cookie"];

    const response = await request(app)
        .get("/logout")
        .set("Cookie", cookie);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
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

    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "A",
            passwort: "A",
            code: "X"
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

test("addInviteCode API", async () => {
    const response = await request(app)
        .post("/api/addInviteCode")
        .send({
            code: "TESTCODE",
            passwort: "Das Adminpasswort"
        });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/invite");
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

test("Account registrieren API", async () => {
    await createInviteCode();

    const response = await request(app)
        .post("/api/registrieren")
        .send({
            username: "abc",
            passwort: "abc",
            code: "X"
        });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
});

test("Account anmelden API", async () => {
    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "def",
            passwort: "def",
            code: "X"
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

test("Freund hinzufügen API", async () => {
    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "A",
            passwort: "A",
            code: "X"
        });

    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "B",
            passwort: "B",
            code: "X"
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

    const uuid = uuidResponse.text;

    const response = await request(app)
        .post("/api/fuegeFreundHinzu")
        .set("Cookie", cookieA)
        .send({
            uuid
        });

    expect(response.text).toContain("/freunde");
});

test("Freund entfernen API", async () => {
    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "D",
            passwort: "D",
            code: "X"
        });

    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "E",
            passwort: "E",
            code: "X"
        });

    const loginD = await request(app)
        .post("/api/anmelden")
        .send({
            username: "D",
            passwort: "D"
        });

    const cookieD = loginD.headers["set-cookie"];

    const loginE = await request(app)
        .post("/api/anmelden")
        .send({
            username: "E",
            passwort: "E"
        });

    const cookieE = loginE.headers["set-cookie"];

    const uuidResponse = await request(app)
        .get("/api/getUUID")
        .set("Cookie", cookieE);

    const uuidE = uuidResponse.text;

    const addResponse = await request(app)
        .post("/api/fuegeFreundHinzu")
        .set("Cookie", cookieD)
        .send({
            uuid: uuidE
        });

    expect(addResponse.text).toContain("/freunde");

    const removeResponse = await request(app)
        .post("/api/entferneFreund")
        .set("Cookie", cookieD)
        .send({
            uuid: uuidE
        });
    
    expect(removeResponse.text).toContain("/freunde");
});

test("Baureihen von Freunden abrufen API", async () => {
    const addBaureihe = await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "a",
            name: "b",
            beschreibung: "c",
            passwort: "Das Adminpasswort"
        });

    expect(addBaureihe.text).toContain("/add");

    await createInviteCode();

    const regA = await request(app)
        .post("/api/registrieren")
        .send({
            username: "UserA",
            passwort: "UserA",
            code: "X"
        });

    expect(regA.text).toContain("/login");

    await createInviteCode();

    const regB = await request(app)
        .post("/api/registrieren")
        .send({
            username: "UserB",
            passwort: "UserB",
            code: "X"
        });

    expect(regB.text).toContain("/login");

    const loginA = await request(app)
        .post("/api/anmelden")
        .send({
            username: "UserA",
            passwort: "UserA"
        });

    expect(loginA.text).toContain("/home");
    expect(loginA.headers["set-cookie"]).toBeDefined();

    const loginB = await request(app)
        .post("/api/anmelden")
        .send({
            username: "UserB",
            passwort: "UserB"
        });

    expect(loginB.text).toContain("/home");
    expect(loginB.headers["set-cookie"]).toBeDefined();

    const cookieA = loginA.headers["set-cookie"];
    const cookieB = loginB.headers["set-cookie"];

    const uuidResponse = await request(app)
        .get("/api/getUUID")
        .set("Cookie", cookieB);

    expect(uuidResponse.status).toBe(200);
    expect(uuidResponse.text).toBeTruthy();

    const uuidB = uuidResponse.text;

    const freundHinzufuegen = await request(app)
        .post("/api/fuegeFreundHinzu")
        .set("Cookie", cookieA)
        .send({
            uuid: uuidB
        });

    expect(freundHinzufuegen.text).toContain("/freunde");

    const gefundenMarkieren = await request(app)
        .post("/api/baureiheAlsGefundenMarkieren")
        .set("Cookie", cookieB)
        .send({
            ubid: "a"
        });

    expect(gefundenMarkieren.text).toContain("/home");

    const response = await request(app)
        .get("/api/baureihenVonFreundenAbrufen")
        .set("Cookie", cookieA);

    expect(response.status).toBe(200);
    expect(response.text).toContain("a");
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

    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "F",
            passwort: "F",
            code: "X"
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

test("Baureihe hinzufügen API", async () => {
    const response = await request(app)
        .post("/api/addBaureihe")
        .send({
            ubid: "ab",
            name: "bb",
            beschreibung: "cb",
            passwort: "Das Adminpasswort"
        });

    expect(response.status).toBe(302);
});

test("getUUID API", async () => {
    await createInviteCode();

    await request(app)
        .post("/api/registrieren")
        .send({
            username: "G",
            passwort: "G",
            code: "X"
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

    expect(response.text).toBeTypeOf("string");
});
