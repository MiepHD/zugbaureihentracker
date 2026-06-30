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
     * @since 08.06.2026
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
     * Gibt eine Liste aller von einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @returns Liste mit allen Einträgen der Tabelle Baureihe.
     */
    public static async getGefundeneBaureihen(uuid: string): Promise<Baureihe[]> {
        return await Aktivitaet.findAll({
            where: {
                uuid
            },
            include: [Baureihe]
        });
    }

    /**
     * @throws NotFoundError
     * @return gibt des Zeitpunkt des Findens zurück oder null, wenn die Baureihe nicht gefunden wurde.
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
}