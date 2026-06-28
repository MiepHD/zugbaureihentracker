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

    public static initRelations() {
        Baureihe.hasMany(Aktivitaet, {
            foreignKey: "ubid"
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
        if (baureihe == null || baureihe == undefined) throw new Error("Diese Baureihe konnte leider nicht gefunden werden.");
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
        if (test > 0) throw new Error("Diese Baureihe existiert bereits.");
        const success = await Baureihe.create({
            ubid,
            name,
            beschreibung
        });
        if (success == null) throw new Error("Diese Baureihe konnte leider nicht erstellt werden.");
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

    /**
     * 
     * @param ubid 
     * @param force 
     * @throws Baureihe existiert nicht.
     * @throws Baureihe wurde bereits von ${isUsed} Nutzern gefunden. Trotzdem löschen?
     * @throws Baureihe konnte nicht gelöscht werden.
     */
    public static async remove(ubid: string, force: boolean): Promise<void> {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test == 0) throw new Error("Diese Baureihe existiert nicht.");
        const isUsed: number = await Aktivitaet.count({
            where: {
                ubid
            }
        });
        if (isUsed > 0) {
            if (!force) throw new Error(`Diese Baureihe wurde bereits von ${isUsed} Nutzern gefunden. Möchtest Du sie trotzdem löschen?`);
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
        if (success == 0) throw new Error("Diese Baureihe konnte leider nicht gelöscht werden.");
    }

    public static async edit(ubid: string, name: string, beschreibung: string) {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test < 1) throw new Error("Diese Baureihe existiert nicht.");
        const success = await Baureihe.findOne({
            where: {
                ubid
            }
        });
        if (success == null) throw new Error("Diese Baureihe konnte leider nicht abgefragt werden.");
        success.setDataValue("name", name);
        success.setDataValue("beschreibung", beschreibung);
        await success.save();
    }
}