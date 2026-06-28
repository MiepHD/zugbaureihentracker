import { Sequelize } from "sequelize";
import { Database } from "../../backend/Database";
import { Baureihe } from "../../backend/models/Baureihe";
import { expect, test, beforeEach, beforeAll } from 'vitest';
import { Nutzer } from "../../backend/models/Nutzer";
import { Freundesliste } from "../../backend/models/Freundesliste";
import { Aktivitaet } from "../../backend/models/Aktivitaet";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: true,
});

const db = new Database(sequelize);

beforeAll(async () => {
    await db.init();
});

beforeEach(async () => {
    await sequelize.truncate({
        cascade: true,
        restartIdentity: true
    });
});


test("Baureihe als gefunden markieren", async () => {
    await db.baureihe.add("a", "b", "c");
    await db.registrierungscodes.add("X");
    await db.nutzer.add("A", "A", "X");
    const sessiontokenA: string | boolean = await db.nutzer.getSessiontoken("A", "A");
    if (typeof sessiontokenA == "string") await db.aktivitaet.alsGefundenMarkieren(sessiontokenA, "a");
});

test("Baureihe abfragen", async () => {
    await db.baureihe.add("a", "b", "c");
    const baureihe: Baureihe | null = await db.baureihe.get("a");
    if (baureihe == null) return;
    expect(await baureihe.getDataValue("ubid")).toBe("a");
    expect(await baureihe.getDataValue("name")).toBe("b");
    expect(await baureihe.getDataValue("beschreibung")).toBe("c");
})

test("Baureihe hinzufügen", async () => {
    await db.baureihe.add("ab", "bb", "cb");
});


test("Anzahl der Baureihen abfragen", async () => {
    await db.baureihe.add("a", "b", "c");
    expect(await db.baureihe.getCount()).toBe(1);
});

test("Account registrieren", async () => {
    await db.registrierungscodes.add("X");
    await db.nutzer.add("abc", "abc", "X");
});

test("Account anmelden", async () => {
    await db.registrierungscodes.add("X");
    await db.nutzer.add("def", "def", "X")
    expect(await db.nutzer.getSessiontoken("def", "def")).toBeTypeOf("string");
});

test("Freund hinzufügen", async () => {
    await db.registrierungscodes.add("X");
    await db.nutzer.add("C", "C", "X");
    await db.registrierungscodes.add("X");
    await db.nutzer.add("B", "B", "X");
    const sessiontokenA: string | boolean = await db.nutzer.getSessiontoken("C", "C");
    const sessiontokenB: string | boolean = await db.nutzer.getSessiontoken("B", "B");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") await db.freundesliste.add(sessiontokenA, await db.nutzer.getUUID(sessiontokenB));
});

test("Freund entfernen", async () => {
    await db.registrierungscodes.add("X");
    await db.nutzer.add("D", "D", "X");
    await db.registrierungscodes.add("X");
    await db.nutzer.add("E", "E", "X");
    const sessiontokenA: string | boolean = await db.nutzer.getSessiontoken("D", "D");
    const sessiontokenB: string | boolean = await db.nutzer.getSessiontoken("E", "E");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") {
        await db.freundesliste.add(sessiontokenA, await db.nutzer.getUUID(sessiontokenB));
        await db.freundesliste.remove(sessiontokenA, await db.nutzer.getUUID(sessiontokenB))
    }
});

test("Gefundene Baureihen auslesen", async () => {
    await db.baureihe.add("a", "b", "c");
    await db.registrierungscodes.add("X");
    await db.nutzer.add("F", "F", "X");
    const sessiontokenA: string | boolean = await db.nutzer.getSessiontoken("F", "F");
    if (typeof sessiontokenA == "string") {
        await db.aktivitaet.alsGefundenMarkieren(sessiontokenA, "a");
        const baureihen: Baureihe[] = await db.aktivitaet.getGefundeneBaureihen(sessiontokenA);
        expect(baureihen[0].getDataValue("ubid")).toBe("a");
    }
});

test("getUUID", async () => {
    await db.registrierungscodes.add("X");
    await db.nutzer.add("G", "G", "X");
    const sessiontokenA: string | boolean = await db.nutzer.getSessiontoken("G", "G");
    if (typeof sessiontokenA == "string") expect(await db.nutzer.getUUID(sessiontokenA)).toBeTypeOf("string");
});

test("InviteCode hinzufügen", async () => {
    await db.registrierungscodes.add("TEST123");
});

test("Baureihen von Freunden abrufen (DB)", async () => {
    await db.baureihe.add("a", "b", "c");

    await db.registrierungscodes.add("X");
    await db.nutzer.add("A", "A", "X");
    await db.registrierungscodes.add("X");
    await db.nutzer.add("B", "B", "X");

    const tokenA = await db.nutzer.getSessiontoken("A", "A");
    const tokenB = await db.nutzer.getSessiontoken("B", "B");

    if (typeof tokenA !== "string" || typeof tokenB !== "string") return;

    const uuidB = await db.nutzer.getUUID(tokenB);

    await db.freundesliste.add(tokenA, uuidB);
    await db.aktivitaet.alsGefundenMarkieren(tokenB, "a");

    const result = await db.freundesliste.baureihenVonFreundenAbrufen(tokenA);

    expect(result).not.toBeNull();
    expect(result[0].ubid).toBe("a");
    expect((result[0] as any).Aktivitaets[0].uuid).toBe(uuidB);
    expect((result[0] as any).Aktivitaets[0].Nutzer.name).toBe("B");
});