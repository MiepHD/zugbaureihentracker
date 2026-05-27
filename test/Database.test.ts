import { Sequelize } from "sequelize";
import { Database } from "../backend/Database";
import { Baureihe } from "../backend/models/Baureihe";
import { expect, test, beforeAll, beforeEach } from 'vitest';

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

beforeEach(async () => {
    await sequelize.truncate({
        cascade: true,
        restartIdentity: true
    });
});

test("Baureihe als gefunden markieren", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.registrieren("A", "A");
    const sessiontokenA: string | boolean = await db.anmelden("A", "A");
    if (typeof sessiontokenA == "string") expect(await db.baureiheAlsGefundenMarkieren(sessiontokenA, "a")).toBe(true);
});

test("Baureihe abfragen", async () => {
    await db.addBaureihe("a", "b", "c");
    const baureihe: Baureihe | null = await db.getBaureihe("a");
    if (baureihe == null) return;
    expect(await baureihe.getDataValue("ubid")).toBe("a");
    expect(await baureihe.getDataValue("name")).toBe("b");
    expect(await baureihe.getDataValue("beschreibung")).toBe("c");
})

test("Baureihe hinzufügen", async () => {
    expect(await db.addBaureihe("ab", "bb", "cb")).toBe(true);
});


test("Anzahl der Baureihen abfragen", async () => {
    await db.addBaureihe("a", "b", "c");
    expect(await db.getGesamtzahlBaureihen()).toBe(1);
});

test("Account registrieren", async () => {
    expect(await db.registrieren("abc", "abc")).toBe(true);
});

test("Account anmelden", async () => {
    await db.registrieren("def", "def")
    expect(await db.anmelden("def", "def")).toBeTypeOf("string");
});

test("Freund hinzufügen", async () => {
    await db.registrieren("C", "C");
    await db.registrieren("B", "B");
    const sessiontokenA: string | boolean = await db.anmelden("C", "C");
    const sessiontokenB: string | boolean = await db.anmelden("B", "B");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") expect(await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true);
});

test("Freund entfernen", async () => {
    await db.registrieren("D", "D");
    await db.registrieren("E", "E");
    const sessiontokenA: string | boolean = await db.anmelden("D", "D");
    const sessiontokenB: string | boolean = await db.anmelden("E", "E");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") {
        await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB));
        expect(await db.entferneFreund(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true)
    }
});

test("Gefundene Baureihen auslesen", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.registrieren("F", "F");
    const sessiontokenA: string | boolean = await db.anmelden("F", "F");
    if (typeof sessiontokenA == "string") {
        await db.baureiheAlsGefundenMarkieren(sessiontokenA, "a");
        const baureihen: Baureihe[] = await db.getGefundeneBaureihen(sessiontokenA);
        expect(baureihen[0].getDataValue("ubid")).toBe("a");
    }
});

test("getUUID", async () => {
    await db.registrieren("G", "G");
    const sessiontokenA: string | boolean = await db.anmelden("G", "G");
    if (typeof sessiontokenA == "string") expect(await db.getUUID(sessiontokenA)).toBeTypeOf("string");
});