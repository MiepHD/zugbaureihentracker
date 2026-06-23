import { Sequelize, DataTypes } from 'sequelize';
import { Nutzer } from './Nutzer';
import { Table } from './Table';

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
     */
    public static async add(sessiontoken: string, uuid: string): Promise<boolean> {
        const uuid2 = await Nutzer.getUUID(sessiontoken);
        if (!uuid2) {
            throw new Error("Sessiontoken ungültig");
        }
        const test = await Freundesliste.count({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
        const test2 = await Nutzer.count({
            where: {
                uuid
            }
        });
        if (test2 == 0) throw new Error("Nutzer existiert nicht.")
        if(test > 0) return false;
        const entry = await Freundesliste.create({
            von: uuid2,
            zu: uuid,
        });
        if(entry != null) return true;
        throw new Error("Hinzufügen nicht möglich.");
    }

    /**
     * Entfernen eines Freundes aus der Freundesliste.
     * @author Tim & Lia
     * @since 05.05.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @param uuid UUID eines Nuters.
     * @returns True or False, ob das Löschen erfolgreich war.
     */
    public static async remove(sessiontoken: string, uuid: string): Promise<boolean> {
        const uuid2: string = await Nutzer.getNutzer(sessiontoken);
        const exit = await Freundesliste.destroy({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
        return exit > 0;
    }

}