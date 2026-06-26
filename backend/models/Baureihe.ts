import { Sequelize, DataTypes } from 'sequelize';
import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';

export class Baureihe extends Table {
    public static initialize(sequelize: Sequelize) {
        Baureihe.init({
            ubid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
            },
            beschreibung: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: 'Baureihe',
        });
    }

    /**Suchen einer Baureihe aus der Datenbank und dazugehöriger Informationen.
     * @author Tim
     * @since 22.05.2026
     * @throws Baureihe konnte nicht gefunden werden.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    public static async get(ubid: string): Promise<Baureihe> {
        const baureihe = await Baureihe.findOne({
            where: {
                ubid,
            }
        });
        if (baureihe == null || baureihe == undefined) throw new Error("Baureihe konnte nicht gefunden werden.");
        return baureihe;
    }

    /** Hinzufügen einer Baureihe in die Datenbank.
     * @author Lia
     * @since 22.05.2026
     * @throws Baureihe existiert bereits.
     * @throws Baureihe konnte nicht erstellt werden.
     */
    public static async add(ubid: string, name: string, beschreibung: string): Promise<void> {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test > 0) throw new Error("Baureihe existiert bereits.");
        const success = await Baureihe.create({
            ubid,
            name,
            beschreibung
        });
        if (success == null) throw new Error("Baureihe konnte nicht erstellt werden.");
    }

    /**
     * Gibt die Gesamtzahl aller gesammelten Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @returns Zahl der gesamten Baureihen.
     */
    public static async getCount(): Promise <number> {
        const n: number = await Baureihe.count();
        return n;
    }

    public static async getAll(): Promise<Baureihe[]> {
        return await Baureihe.findAll();
    }

    public static async remove(ubid: string, force: boolean): Promise<void> {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test == 0) throw new Error("Baureihe existiert nicht.");
        const isUsed: number = await Aktivitaet.count({
            where: {
                ubid
            }
        });
        if (isUsed > 0) {
            if (!force) throw new Error(`Baureihe wurde bereits von ${isUsed} Nutzern gefunden. Trotzdem löschen?`);
            await Aktivitaet.destroy({
                where: {
                    ubid
                }
            });
        }
        const success = await Baureihe.destroy({
            where: {
                ubid
            }
        });
        if (success == 0) throw new Error("Baureihe konnte nicht gelöscht werden.");
    }
}