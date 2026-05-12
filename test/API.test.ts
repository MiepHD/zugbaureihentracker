import { Sequelize } from "sequelize";
import { API } from "../backend/API";
import { expect, test, beforeAll } from 'vitest';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
});

const api = new API(sequelize);

beforeAll(async () => {
    await api.init();
    await sequelize.sync({ force: true });
});

test(`Baureihe kann hinzugefügt werden`, async () => {
    expect(await api.addBaureihe("a", "b", "c")).toBe(true);
});


test(`Anzahl der Baureihen kann abgefragt werden`, async () => {
    await api.addBaureihe("a", "b", "c");
    expect(await api.getGesamtzahlBaureihen()).toBe(1);
});
