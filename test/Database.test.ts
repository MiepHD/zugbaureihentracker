import { Sequelize } from "sequelize";
import { Database } from "../backend/Database";
import { expect, test, beforeAll } from 'vitest';

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
    
});

test("Freund hinzufügen", async () => {

});

test("Freund entfernen", async () => {

});

test("Gefundene Baureihen auslesen", async () => {

});