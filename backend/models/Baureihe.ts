import { Sequelize, DataTypes } from 'sequelize';
import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';
import { Nutzer } from './Nutzer';

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

    /** Eine Baureihe als gefunden markieren, indem ein Eintrag in der Tabelle Aktivität erstellt wird.
     * @author Tim
     * @since 08.06.2026
     * @param sessiontoken 
     * @param ubid 
     */
    public static async alsGefundenMarkieren(token: string, ubid: string): Promise<boolean> {
        const uuid = await Nutzer.getNutzer(token);
        if (!uuid) {
            return false;
        }
        const baureihe = await this.get(ubid);
        if (!baureihe) {
            return false;
        }
        const test = await Aktivitaet.count({
            where: {
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
            }
        });
        if (test > 0) return false;
        const neueAktivitaet = await Aktivitaet.create({
            uuid: uuid,
            ubid: baureihe.getDataValue("ubid"),
        });
        return neueAktivitaet !== null;
    }


    /**Suchen einer Baureihe aus der Datenbank und dazugehöriger Informationen.
     * @author Tim
     * @since 22.05.2026
     */
    public static async get(ubid: string): Promise<Baureihe | null> {
        return await Baureihe.findOne({
            where: {
                ubid: ubid,
            }
        });
    }

    /** Hinzufügen einer Baureihe in die Datenbank.
     * @author Lia
     * @since 22.05.2026
     */
    public static async add(ubid: string, name: string, beschreibung: string): Promise<boolean> {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test > 0) return false;
        await Baureihe.create({
            ubid,
            name,
            beschreibung
        });
        return true;
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
}