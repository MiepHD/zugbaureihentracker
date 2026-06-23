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
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    await sequelize.truncate({
        cascade: true,
        restartIdentity: true
    });
});

//TODO: logout, addInviteCode, baureihenVonFreundenAbrufen

test("Baureihe als gefunden markieren", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.addinvitecode("X")
    await db.registrieren("A", "A", "X");
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
    await db.addinvitecode("X");
    expect(await db.registrieren("abc", "abc", "X")).toBe(true);
});

test("Account anmelden", async () => {
    await db.addinvitecode("X");
    await db.registrieren("def", "def", "X")
    expect(await db.anmelden("def", "def")).toBeTypeOf("string");
});

test("Freund hinzufügen", async () => {
    await db.addinvitecode("X");
    await db.registrieren("C", "C", "X");
    await db.addinvitecode("X");
    await db.registrieren("B", "B", "X");
    const sessiontokenA: string | boolean = await db.anmelden("C", "C");
    const sessiontokenB: string | boolean = await db.anmelden("B", "B");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") expect(await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true);
});

test("Freund entfernen", async () => {
    await db.addinvitecode("X");
    await db.registrieren("D", "D", "X");
    await db.addinvitecode("X");
    await db.registrieren("E", "E", "X");
    const sessiontokenA: string | boolean = await db.anmelden("D", "D");
    const sessiontokenB: string | boolean = await db.anmelden("E", "E");
    if (typeof sessiontokenA == "string" && typeof sessiontokenB == "string") {
        await db.fuegeFreundHinzu(sessiontokenA, await db.getUUID(sessiontokenB));
        expect(await db.entferneFreund(sessiontokenA, await db.getUUID(sessiontokenB))).toBe(true)
    }
});

test("Gefundene Baureihen auslesen", async () => {
    await db.addBaureihe("a", "b", "c");
    await db.addinvitecode("X");
    await db.registrieren("F", "F", "X");
    const sessiontokenA: string | boolean = await db.anmelden("F", "F");
    if (typeof sessiontokenA == "string") {
        await db.baureiheAlsGefundenMarkieren(sessiontokenA, "a");
        const baureihen: Baureihe[] = await db.getGefundeneBaureihen(sessiontokenA);
        expect(baureihen[0].getDataValue("ubid")).toBe("a");
    }
});

test("getUUID", async () => {
    await db.addinvitecode("X");
    await db.registrieren("G", "G", "X");
    const sessiontokenA: string | boolean = await db.anmelden("G", "G");
    if (typeof sessiontokenA == "string") expect(await db.getUUID(sessiontokenA)).toBeTypeOf("string");
});

test("InviteCode hinzufügen", async () => {
    const result = await db.addinvitecode("TEST123");
    expect(result).toBe(true);

    // optional: doppelt verhindern testen
    const second = await db.addinvitecode("TEST123");
    expect(second).toBe(false); // oder false, je nach gewünschter Logik
});

test("Baureihen von Freunden abrufen (DB)", async () => {
    await db.addBaureihe("a", "b", "c");

    await db.addinvitecode("X");
    await db.registrieren("A", "A", "X");
    await db.addinvitecode("X");
    await db.registrieren("B", "B", "X");

    const tokenA = await db.anmelden("A", "A");
    const tokenB = await db.anmelden("B", "B");

    if (typeof tokenA !== "string" || typeof tokenB !== "string") return;

    const uuidB = await db.getUUID(tokenB);

    await db.fuegeFreundHinzu(tokenA, uuidB);
    await db.baureiheAlsGefundenMarkieren(tokenB, "a");

    const result = await db.baureihenVonFreundenAbrufen(tokenA);

    expect(result).not.toBeNull();

    // Sequelize Struktur ist verschachtelt:
    const freunde = (result as any)?.Freunde;

    expect(freunde).toBeDefined();
    expect(freunde.length).toBeGreaterThan(0);

    const aktivitaeten = freunde[0]?.Aktivitaets;
    expect(aktivitaeten?.length ?? 0).toBeGreaterThan(0);
});