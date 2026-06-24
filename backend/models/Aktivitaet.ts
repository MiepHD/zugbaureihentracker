import { Sequelize,DataTypes } from 'sequelize';
import { Nutzer } from './Nutzer';
import { Baureihe } from './Baureihe';
import { Table } from './Table';

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
        },
        {
            sequelize,
            modelName: 'Aktivitaet',
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

    /** Eine Baureihe als gefunden markieren, indem ein Eintrag in der Tabelle Aktivität erstellt wird.
     * @author Tim
     * @since 08.06.2026
     * @param sessiontoken 
     * @param ubid 
     */
    public static async alsGefundenMarkieren(token: string, ubid: string): Promise<boolean> {
        const uuid = await Nutzer.getUUID(token);
        if (!uuid) {
            return false;
        }
        const baureihe = await Baureihe.get(ubid);
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

    /**
     * Gibt eine Liste an allen on einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @returns Liste mit allen Einträgen der Tabelle Baureihe.
     */
    public static async getGefundeneBaureihen(sessiontoken: string): Promise<Baureihe[]> {
        const uuid: string = await Nutzer.getUUID(sessiontoken);
        return Aktivitaet.findAll({
            where: {
                uuid: uuid,
            },
            include: [Baureihe]
        });
    }
}