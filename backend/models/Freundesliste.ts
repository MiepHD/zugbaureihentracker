import { Sequelize, DataTypes } from 'sequelize';
import { Nutzer } from './Nutzer';
import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';

import { Nutzer as DBNutzer } from "../models/Nutzer";

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
            }
        },
        {
            sequelize,
            modelName: 'Freundesliste',
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
        if (exit == 0) throw Error("Dieser Freund konnte leider nicht aus Deiner Freundesliste entfernt werden.");
    }

    /**
     * 
     * @param sessiontoken 
     * @returns 
     * @throws Daten konnten nicht abgefragt werden.
     */
    public static async baureihenVonFreundenAbrufen(sessiontoken: string): Promise<Nutzer> {
        const tabelle = await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken,
            },
            // Hier müssen wir eine Spalte der Tabelle auswählen, da sonst sqlite die Tabellen nicht verbinden kann
            attributes: ["uuid"], 
            include: [
                {
                    model: Nutzer,
                    as: 'Freunde',
                    // Schließt die IDs aus der Freundesliste-Zwischentabelle (von/zu) aus den Rohdaten aus
                    through: { attributes: ["von", "zu"] }, 
                    // Hier wählen wir nur den Namen des Freundes aus
                    attributes: ['name', 'uuid'], 
                    include: [
                        {
                            model: Aktivitaet,
                            required: false, 
                            attributes: ["ubid"],
                        }
                    ]
                }
            ]
        });
        if (tabelle == null) throw Error("Die Baureihen Deiner Freunde konnten leider nicht abgefragt werden.");
        return tabelle;
    }
}