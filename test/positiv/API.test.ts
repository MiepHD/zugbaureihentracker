import { Sequelize } from "sequelize";
import express, { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, expect, test } from "vitest";
import { API } from "../../backend/api/API";

let app: Express;
let sequelize: Sequelize;

beforeAll(async () => {
    sequelize = new Sequelize({ dialect: "sqlite", storage: ":memory:", logging: false });
    app = express();
    await new API(sequelize, "Das Adminpasswort").init(app);
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
});

// --- REUSABLE HELPERS ---

async function createInviteCode(code = "X") {
    await request(app).post("/api/addInviteCode").send({ code, passwort: "Das Adminpasswort" });
}

async function registerAndLogin(username: string) {
    await createInviteCode();
    await request(app).post("/api/registrieren").send({ username, passwort: username, code: "X" });
    const login = await request(app).post("/api/anmelden").send({ username, passwort: username });
    return login.headers["set-cookie"];
}

async function loginAsAdmin(username: string) {
    const cookie = await registerAndLogin(username);
    await request(app).post("/api/elevate").set("Cookie", cookie).send({ passwort: "Das Adminpasswort" });
    return cookie;
}

async function addTestBaureihe(cookie: any, ubid = "a") {
    await request(app).post("/api/addBaureihe").set("Cookie", cookie).send({ ubid, name: "b", beschreibung: "c" });
}

async function getUUID(cookie: any) {
    const res = await request(app).get("/api/getUUID").set("Cookie", cookie);
    return res.text;
}

// --- TESTS ---

test("Logout API", async () => {
    const cookie = await registerAndLogin("LogoutUser");
    const response = await request(app).get("/logout").set("Cookie", cookie);
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
});

test("Baureihe als gefunden markieren API", async () => {
    const cookie = await loginAsAdmin("A");
    await addTestBaureihe(cookie);
    const response = await request(app).post("/api/baureiheAlsGefundenMarkieren").set("Cookie", cookie).send({ ubid: "a" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("/home?successMessage");
});

test("addInviteCode API", async () => {
    const response = await request(app).post("/api/addInviteCode").send({ code: "TESTCODE", passwort: "Das Adminpasswort" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("/invite?successMessage");
});

test("Baureihe abfragen API", async () => {
    const cookie = await loginAsAdmin("F");
    await addTestBaureihe(cookie);
    const response = await request(app).get("/api/getBaureihe").set("Cookie", cookie).query({ ubid: "a" });
    expect(response.status).toBe(200);
    const baureihe = JSON.parse(response.text);
    expect(baureihe.baureihe.ubid).toBe("a");
});

test("Account registrieren API", async () => {
    await createInviteCode();
    const response = await request(app).post("/api/registrieren").send({ username: "abc", passwort: "abc", code: "X" });
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain("/login?successMessage");
});

test("Account anmelden API", async () => {
    await createInviteCode();
    await request(app).post("/api/registrieren").send({ username: "def", passwort: "def", code: "X" });
    const response = await request(app).post("/api/anmelden").send({ username: "def", passwort: "def" });
    expect(response.status).toBe(302);
    expect(response.headers["set-cookie"]).toBeDefined();
});

test("Freund hinzufügen API", async () => {
    const cookieA = await registerAndLogin("A");
    const cookieB = await registerAndLogin("B");
    const uuidB = await getUUID(cookieB);

    const response = await request(app).post("/api/fuegeFreundHinzu").set("Cookie", cookieA).send({ uuid: uuidB });
    expect(response.text).toContain("/leaderboard");
});

test("Freund entfernen API", async () => {
    const cookieD = await registerAndLogin("D");
    const cookieE = await registerAndLogin("E");
    const uuidE = await getUUID(cookieE);

    await request(app).post("/api/fuegeFreundHinzu").set("Cookie", cookieD).send({ uuid: uuidE });
    const removeResponse = await request(app).post("/api/entferneFreund").set("Cookie", cookieD).send({ uuid: uuidE });
    expect(removeResponse.text).toContain("/leaderboard");
});

test("Baureihen von Freunden abrufen API", async () => {
    const cookieA = await loginAsAdmin("UserA");
    const cookieB = await registerAndLogin("UserB");
    await addTestBaureihe(cookieA);
    const uuidB = await getUUID(cookieB);

    await request(app).post("/api/fuegeFreundHinzu").set("Cookie", cookieA).send({ uuid: uuidB });
    await request(app).post("/api/baureiheAlsGefundenMarkieren").set("Cookie", cookieB).send({ ubid: "a" });

    const response = await request(app).get("/api/baureihenVonFreundenAbrufen").set("Cookie", cookieA);
    expect(response.status).toBe(200);
    expect(response.text).toContain("a");
});

test("Gefundene Baureihen API", async () => {
    const cookie = await loginAsAdmin("F");
    await addTestBaureihe(cookie);
    await request(app).post("/api/baureiheAlsGefundenMarkieren").set("Cookie", cookie).send({ ubid: "a" });

    const response = await request(app).get("/api/getGefundeneBaureihen").set("Cookie", cookie);
    expect(JSON.parse(response.text)[0].ubid).toBe("a");
});

test("Gesamtzahl Baureihen API", async () => {
    const cookie = await loginAsAdmin("F");
    await addTestBaureihe(cookie);
    const response = await request(app).get("/api/getGesamtzahlBaureihen").set("Cookie", cookie);
    expect(response.text).toBe("1");
});

test("Baureihe hinzufügen API", async () => {
    const cookie = await loginAsAdmin("F");
    const response = await request(app).post("/api/addBaureihe").set("Cookie", cookie).send({ ubid: "ab", name: "bb", beschreibung: "cb" });
    expect(response.status).toBe(302);
});

test("getUUID API", async () => {
    const cookie = await registerAndLogin("G");
    const response = await request(app).get("/api/getUUID").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.text).toBeTypeOf("string");
});