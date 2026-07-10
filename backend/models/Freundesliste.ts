import { Sequelize, DataTypes, literal, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';

import { Nutzer } from './Nutzer';
import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';
import { Baureihe } from './Baureihe';

import { NotFoundError } from '../error/NotFoundError';
import { ConflictError } from '../error/ConflictError';

export class Freundesliste extends Table {
    public static initialize(sequelize: Sequelize) {
        Freundesliste.init({
            von: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            zu: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            isComplete: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            }
        },
        {
            sequelize,
            modelName: 'Freundesliste',
            indexes: [{
                unique: true,
                fields: ['von', 'zu'],
            }],
        });
    }

    public static initRelations(): void {
        Freundesliste.belongsTo(Nutzer,{
            as: "eingehendeAnfragen",
            foreignKey: "von"
        });
        Freundesliste.belongsTo(Nutzer,{
            as: "ausgehendeAnfragen",
            foreignKey: "zu"
        });
    }

    /**
     * Hinzufügen eines Freundes in die Freundesliste.
     * @author Tim & Lia
     * @since 05.05.2026
     * @throws ConflictError
     * @throws NotFoundError
     */
    public static async add(sessiontoken: string, uuid: string): Promise<void> {
        const uuid2 = await Nutzer.getUUID(sessiontoken);
        try {
            await Freundesliste.create({
                von: uuid2,
                zu: uuid,
            });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) throw new ConflictError("bereitsBefreundet");
            if (e instanceof ForeignKeyConstraintError) throw new NotFoundError("uuid");
            throw e;
        }
    }

    /**
     * Entfernen eines Freundes aus der Freundesliste.
     * @author Tim & Lia
     * @since 05.05.2026
     * @throws NotFoundError
     */
    public static async remove(sessiontoken: string, uuid: string): Promise<void> {
        const uuid2: string = await Nutzer.getUUID(sessiontoken);
        const exit = await Freundesliste.destroy({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
        const exit2 = await Freundesliste.destroy({
            where: {
                von: uuid,
                zu: uuid2,
            }
        });
        if (exit == 0 && exit2 == 0) throw new NotFoundError("freundschaft");
    }

    /**
     * @throws NotFoundError
     */
    public static async baureihenVonFreundenAbrufen(sessiontoken: string): Promise<Baureihe[]> {
        const uuid = await Nutzer.getUUID(sessiontoken);
        const tabelle = await Baureihe.findAll({
            attributes: ["ubid"],
            include: [{
                model: Aktivitaet,
                attributes: ["uuid"],
                required: true,
                include: [{
                    model: Nutzer,
                    required: true, 
                    attributes: ["name"],
                    include: [{
                        model: Nutzer,
                        as: "WirdGefolgtVon",
                        through: {
                            where: { isComplete: true },
                            attributes: []
                        },
                        required: true,
                        where: { uuid },
                        attributes: []
                    }]
                }]
            }],
            order: [["ubid", "ASC"]]
        });
        return tabelle;
    }

    /**
     * 
     * @throws NotFoundError
     */
    public static async getRanking(sessiontoken: string): Promise<Nutzer> {
        const uuid = await Nutzer.getUUID(sessiontoken);
        const test = await Freundesliste.count({
            where: {
                von: uuid,
                zu: uuid
            }
        });
        if (test == 0) await Freundesliste.create({
            von: uuid,
            zu: uuid,
            isComplete: true
        });
        const tabelle = await Nutzer.findAll({
            where: { sessiontoken },
            attributes: ["uuid"], 
            subQuery: false,
            include: [{
                model: Nutzer,
                as: 'Freunde',
                through: { 
                    where: { isComplete: true },
                    attributes: ["isComplete"]
                },
                attributes: [
                    'name', 
                    'uuid',
                    // Subquery: Zählt die Aktivitäten direkt für jeden Freund
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM Aktivitaets AS a
                            WHERE a.uuid = Freunde.uuid
                        )`),
                        'score'
                    ]
                ]
            }],
            order: [
                [literal('`Freunde.score`'), 'DESC'] // Beachte die Backticks passend zum MariaDB SQL-Dialekt
            ]
        });
        return tabelle[0];
    }

    /**
     * @throws NotFoundError
     */
    public static async akzeptiereFreundschaftsanfrage(sessiontoken: string, uuid: string): Promise<void> {
        const uuid2 = await Nutzer.getUUID(sessiontoken);

        /**
         * Edge case falls jemand auf mysteriöse Art und Weise eine Freundschaftsanfrage von sich selbst annimmt. (Stellt sicher, dass Abnormalitäten in der Datenbank, dass man nicht mit sich selbst befreundet ist, selbstständig repariert werden können)
         */
        if (uuid == uuid2) {
            const entry = await Freundesliste.findOne({
                where: {
                    von: uuid,
                    zu: uuid
                }
            });
            entry?.setDataValue("isComplete", true);
            await entry?.save();
            return;
        }

        
        const anfrage = await Freundesliste.findOne({
            where: {
                von: uuid,
                zu: uuid2
            }
        });
        if (anfrage == null) throw new NotFoundError("freundschaftsanfrage");
        anfrage.setDataValue("isComplete", true);
        await anfrage.save();
        const gegenrichtung = await Freundesliste.findOne({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
        if (gegenrichtung == null) {
            await Freundesliste.create({
                von: uuid2,
                zu: uuid,
                isComplete: true
            });
        } else {
            gegenrichtung.setDataValue("isComplete", true);
            await gegenrichtung.save();
        }
    }

    /**
     * @throws NotFoundError
     */
    public static async getAusstehendeFreundschaftsanfragen(sessiontoken: string): Promise<{ eingehend: Freundesliste[], ausgehend: Freundesliste[] }> {
        const uuid = await Nutzer.getUUID(sessiontoken);
        return {
            eingehend: await Freundesliste.findAll({
                where: {
                    zu: uuid,
                    isComplete: false
                },
                include: [{
                    model: Nutzer,
                    as: "eingehendeAnfragen",
                    attributes: ["name"],
                }]
            }),
            ausgehend: await Freundesliste.findAll({
                where: {
                    von: uuid,
                    isComplete: false
                },
                include: [{
                    model: Nutzer,
                    as: "ausgehendeAnfragen",
                    attributes: ["name"],
                }]
            })
        };
    }

    /**
     * @throws NotFoundError
     */
    public static async deleteAnfrage(vonUUID: string, zuUUID: string) {
        const result = await Freundesliste.destroy({
            where: {
                von: vonUUID,
                zu: zuUUID
            }
        });
        if (result == 0) throw new NotFoundError("freundschaftsanfrage");
    }

    public static async sindBefreundet(vonUUID: string, zuUUID: string): Promise<boolean> {
        const result = await Freundesliste.count({
            where: {
                von: vonUUID,
                zu: zuUUID,
                isComplete: true
            }
        });
        return result > 0;
    }
}