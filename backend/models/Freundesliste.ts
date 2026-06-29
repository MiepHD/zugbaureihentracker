import { Sequelize, DataTypes, literal } from 'sequelize';
import { Nutzer } from './Nutzer';
import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';

import { Nutzer as DBNutzer } from "../models/Nutzer";
import { Baureihe } from './Baureihe';

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
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @param uuid User ID eines Nutzers.
     * @returns True or false, on das Hinzufügen erfolgreich war.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     * @throws Freund ist bereits in Freundesliste.
     * @throws Freund konnte nicht hinzugefügt werden.
     */
    public static async add(sessiontoken: string, uuid: string): Promise<void> {
        const uuid2 = await Nutzer.getUUID(sessiontoken);
        const uuidExists = await DBNutzer.count({
            where: {
                uuid
            }
        });
        if (uuidExists == 0) throw new Error("Diese UUID existiert nicht.");
        const test = await Freundesliste.count({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
        if(test > 0) throw new Error("Diesen Freund hast Du bereits in Deiner Freundesliste.");
        const entry = await Freundesliste.create({
            von: uuid2,
            zu: uuid,
        });
        if(entry == null) throw new Error("Dieser Freund konnte leider nicht Deiner Freundesliste hinzugefügt werden.");
    }

    /**
     * Entfernen eines Freundes aus der Freundesliste.
     * @author Tim & Lia
     * @since 05.05.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @param uuid UUID eines Nuters.
     * @returns True or False, ob das Löschen erfolgreich war.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     * @throws Freund konnte nicht entfernt werden.
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
        if (exit == 0 || exit2 == 0) throw Error("Dieser Freund konnte leider nicht aus Deiner Freundesliste entfernt werden.");
    }

    /**
     * 
     * @param sessiontoken 
     * @returns 
     * @throws Daten konnten nicht abgefragt werden.
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
                            where: {
                                isComplete: true
                            },
                            attributes: []
                        },
                        required: true,
                        where: {
                            uuid
                        },
                        attributes: []
                    }]
                }]
            }],
            order: [["ubid", "ASC"]]
        });
        if (tabelle == null) throw Error("Die Baureihen Deiner Freunde konnten leider nicht abgefragt werden.");
        return tabelle;
    }

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
            zu: uuid
        });
        const tabelle = await Nutzer.findAll({
            where: {
                sessiontoken,
            },
            attributes: ["uuid"], 
            subQuery: false,
            include: [
                {
                    model: Nutzer,
                    as: 'Freunde',
                    through: { 
                        where: {
                            isComplete: true
                        },
                        attributes: ["isComplete"]
                     }, // Blendet die Zwischentabelle aus
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
                }
            ],
            order: [
                [literal('`Freunde.score`'), 'DESC'] // Beachte die Backticks passend zu deinem SQL-Dialekt
            ]
        });
        if (tabelle == null) throw new Error("Das Freundesleaderboard konnte leider nicht abgefragt werden.");
        return tabelle[0];
    }

    public static async akzeptiereFreundschaftsanfrage(sessiontoken: string, uuid: string){
        const uuid2 = await Nutzer.getUUID(sessiontoken);
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
        const test = await Freundesliste.count({
            where: {
                von: uuid,
                zu: uuid2,
                isComplete: false
            }
        });
        if (test == 0) throw new Error("Von diesem Nutzer hast Du keine Freundschaftsanfrage erhalten.");
        const result = await Freundesliste.create({
            von: uuid2,
            zu: uuid,
            isComplete: true
        })
        if (result == null) throw new Error("Freundschaft konnte leider nicht erstellt werden.");
        const anfrage = await Freundesliste.findOne({
            where: {
                von: uuid,
                zu: uuid2
            }
        });
        if (anfrage == null) throw new Error("Freundschaftsanfrage konnte leider nicht gefunden werden.");
        anfrage.setDataValue("isComplete", true);
        await anfrage.save();
    }

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

    public static async deleteAnfrage(vonUUID: string, zuUUID: string) {
        const result = await Freundesliste.destroy({
            where: {
                von: vonUUID,
                zu: zuUUID
            }
        });
        if (result == 0) throw new Error("Freundschaftsanfrage konnt leider nicht gelöscht werden.");
    }
}