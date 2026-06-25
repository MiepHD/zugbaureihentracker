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
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     * @throws Baureihe konnte nicht gefunden werden.
     * @throws Baureihe ist bereits als "Gefunden" markiert.
     * @throws Baureihe konnte nicht als "Gefunden" markiert werden.
     */
    public static async alsGefundenMarkieren(token: string, ubid: string): Promise<void> {
        const uuid = await Nutzer.getUUID(token);
        const baureihe = await Baureihe.get(ubid);
        const test = await Aktivitaet.count({
            where: {
                uuid: uuid,
                ubid: baureihe.getDataValue("ubid"),
            }
        });
        if (test > 0) throw new Error(`Baureihe ist bereits als "Gefunden" markiert.`);
        const neueAktivitaet = await Aktivitaet.create({
            uuid: uuid,
            ubid: baureihe.getDataValue("ubid"),
        });
        if (neueAktivitaet == null) throw new Error(`Baureihe konnte nicht als "Gefunden" markiert werden.`);
    }

    /**
     * Gibt eine Liste an allen on einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @returns Liste mit allen Einträgen der Tabelle Baureihe.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    public static async getGefundeneBaureihen(sessiontoken: string): Promise<Baureihe[]> {
        const uuid: string = await Nutzer.getUUID(sessiontoken);
        return await Aktivitaet.findAll({
            where: {
                uuid: uuid,
            },
            include: [Baureihe]
        });
    }
}