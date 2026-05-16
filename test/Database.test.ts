import { Sequelize } from "sequelize";
import { Database } from "../backend/Database";
import { Baureihe } from "../backend/models/Baureihe";
import { expect, test, beforeAll, assertType } from 'vitest';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
});

const db = new Database(sequelize);

beforeAll(async () => {
    await db.init();
    await sequelize.sync({ force: true });
});

test("Baureihe als gefunden markieren", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.registieren("A", "A");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    if (typeof sessiontokenA == "string") expect(await db.baureiheAlsGefundenMarkieren(sessiontokenA, "a")).toBe(true);
});

test("Baureihe abfragen", async () => {
    await db.addBaureihe("a", "b", "c");
    const baureihe: Baureihe = await db.getBaureihe("a");
    expect(await baureihe.getDataValue("ubid")).toBe("a");
    expect(await baureihe.getDataValue("name")).toBe("b");
    expect(await baureihe.getDataValue("beschreibung")).toBe("c");
})

test("Baureihe hinzufügen", async () => {
    expect(await db.addBaureihe("a", "b", "c")).toBe(true);
});


test("Anzahl der Baureihen abfragen", async () => {
    await db.addBaureihe("a", "b", "c");
    expect(await db.getGesamtzahlBaureihen()).toBe(1);
});

test("Account registrieren", async () => {
    expect(await db.registieren("abc", "abc")).toBe(true);
});

test("Account anmelden", async () => {
    await db.registieren("abc", "abc")
    expect(await db.anmelden("abc", "abc")).toBeTypeOf("string");
});

test("Freund hinzufügen", async () => {
    await db.registieren("A", "A");
    await db.registieren("B", "B");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    const sessiontokenB: string | boolean = await db.anmelden("B", "B");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") expect(await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true);
});

test("Freund entfernen", async () => {
    await db.registieren("A", "A");
    await db.registieren("B", "B");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    const sessiontokenB: string | boolean = await db.anmelden("B", "B");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") {
        await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB));
        expect(await db.entferneFreund(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true)
    }
});

test("Gefundene Baureihen auslesen", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.registieren("A", "A");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    if (typeof sessiontokenA == "string") {
        await db.baureiheAlsGefundenMarkieren(sessiontokenA, "a");
        const baureihen: Baureihe[] = await db.getGefundeneBaureihen(sessiontokenA);
        expect(baureihen[0].getDataValue("ubid")).toBe("a");
    }
});

test("getUUID", async () => {
    await db.registieren("A", "A");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    if (typeof sessiontokenA == "string") expect(await db.getUUID(sessiontokenA)).toBeTypeOf("string");
});