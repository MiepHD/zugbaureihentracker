import { Sequelize, DataTypes, UniqueConstraintError } from 'sequelize';

import { Nutzer } from './Nutzer';
import { Baureihe } from './Baureihe';
import { Table } from './Table';

import { NotFoundError } from '../error/NotFoundError';

export class Aktivitaet extends Table {
    public static initialize(sequelize: Sequelize) {
        Aktivitaet.init({
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            ubid: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: Baureihe,
                    key: 'ubid',
                },
            },
            gefahren: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            gefahrenAm: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'Aktivitaet',
            indexes: [{
                unique: true,
                fields: ['uuid', 'ubid'],
            }],
        });
    }

    public static initRelations() {
        Aktivitaet.belongsTo(Baureihe, {
            foreignKey: "ubid"
        });
        Aktivitaet.belongsTo(Nutzer, {
            foreignKey: "uuid"
        });
    }

    /**
     * Eine Baureihe als gefunden markieren, indem ein Eintrag in der Tabelle Aktivität erstellt wird.
     * @author Tim
     * @throws NotFoundError
     */
    public static async alsGefundenMarkieren(token: string, ubid: string): Promise<void> {
        const uuid = await Nutzer.getUUID(token);
        const baureihe = await Baureihe.get(ubid);
        try {
            await Aktivitaet.create({
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
            });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) throw new NotFoundError("nichtAlsGefundenMarkiert");
            throw e;
        }
    }

    /**
     * Eine Baureihe als gefunden markieren, indem ein Eintrag in der Tabelle Aktivität erstellt wird.
     * @author Tim
     * @throws NotFoundError
     */
    public static async alsGefahrenMarkieren(token: string, ubid: string): Promise<void> {
        const uuid = await Nutzer.getUUID(token);
        const baureihe = await Baureihe.get(ubid);
        try {
            await Aktivitaet.create({
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
                gefahren: true,
                gefahrenAm: new Date().toISOString()
            });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) {
                const entry = await Aktivitaet.findOne({
                    where: {
                        uuid,
                        ubid: baureihe.getDataValue("ubid")
                    }
                });
                entry?.setDataValue("gefahren", true);
                entry?.setDataValue("gefahrenAm", new Date().toISOString());
                await entry?.save();
                return;
            }
            throw e;
        }
    }

    /**
     * Gibt eine Liste aller von einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @returns Liste mit Einträgen von Aktivitaet und include von Baureihe.
     */
    public static async getGefundeneBaureihen(uuid: string): Promise<Aktivitaet[]> {
        return await Aktivitaet.findAll({
            where: {
                uuid
            },
            include: [Baureihe]
        });
    }

    /**
     * @throws NotFoundError
     * @return Zeitpunkt des Findens oder null, wenn die Baureihe nicht gefunden wurde.
     */
    public static async istGefunden(ubid: string, sessiontoken: string): Promise<string | null> {
        const found = await Aktivitaet.findOne({
            where: {
                ubid,
                uuid: await Nutzer.getUUID(sessiontoken),
            }
        });
        if (found == null) return null;
        return (found as unknown as { createdAt: string}).createdAt;
    }

    /**
     * @throws NotFoundError
     * @return Zeitpunkt des Fahrens zurück oder null, wenn die Baureihe nicht gefahren wurde.
     */
    public static async istGefahren(ubid: string, sessiontoken: string): Promise<string | null> {
        const found = await Aktivitaet.findOne({
            where: {
                ubid,
                uuid: await Nutzer.getUUID(sessiontoken),
                gefahren: true
            }
        });
        if (found == null) return null;
        return (found as unknown as { gefahrenAm: string}).gefahrenAm;
    }

    /**
     * @throws NotFoundError
     */
    public static async alsNichtGefundenMarkieren(token: string, ubid: string): Promise<void> {
        const uuid = await Nutzer.getUUID(token);
        const baureihe = await Baureihe.get(ubid);
        const count = await Aktivitaet.destroy({
            where: {
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
            }
        });
        if (count == 0) throw new NotFoundError("nichtAlsGefundenMarkiert");
    }

    /**
     * @throws NotFoundError
     */
    public static async alsNichtGefahrenMarkieren(token: string, ubid: string): Promise<void> {
        const uuid = await Nutzer.getUUID(token);
        const baureihe = await Baureihe.get(ubid);
        const entry = await Aktivitaet.findOne({
            where: {
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
            }
        });
        if (entry == null) throw new NotFoundError("nichtAlsGefahrenMarkiert");
        entry.setDataValue("gefahren", false);
        await entry.save();
    }
}