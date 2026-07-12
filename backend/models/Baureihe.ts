import { Sequelize, DataTypes, UniqueConstraintError } from 'sequelize';

import { Table } from './Table';
import { Aktivitaet } from './Aktivitaet';

import { NotFoundError } from '../error/NotFoundError';
import { ConflictError } from '../error/ConflictError';

export class Baureihe extends Table {
    public static initialize(sequelize: Sequelize) {
        Baureihe.init({
            ubid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true
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

    /**
     * Suchen einer Baureihe aus der Datenbank und dazugehöriger Informationen.
     * @author Tim
     * @since 22.05.2026
     * @throws NotFoundError
     */
    public static async get(ubid: string): Promise<Baureihe> {
        const baureihe = await Baureihe.findOne({
            where: {
                ubid,
            }
        });
        if (!baureihe) throw new NotFoundError("baureihe");
        return baureihe;
    }

    /**
     * Hinzufügen einer Baureihe in die Datenbank.
     * @author Lia
     * @since 22.05.2026
     * @throws ConflictError
     */
    public static async add(ubid: string, name: string, beschreibung: string): Promise<void> {
        try {
            await Baureihe.create({
                ubid,
                name,
                beschreibung
            });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) throw new ConflictError("baureiheExistiert");
            throw e;
        }
    }

    /**
     * @author Tim & Lia
     * @since 28.04.2026
     * @returns Anzahl aller Baureihen
     */
    public static async getCount(): Promise <number> {
        const n: number = await Baureihe.count();
        return n;
    }

    public static async getAll(): Promise<Baureihe[]> {
        return await Baureihe.findAll();
    }

    /**
     * Baureihe löschen
     * @param force Erzwingt das Löschen der Baureihe, wodurch alle mit der Baureihe in Verbindung stehenden Daten gelöscht werden
     * @throws ConflictError
     * @throws NotFoundError
     */
    public static async remove(ubid: string, force: boolean): Promise<void> {
        const isUsed: number = await Aktivitaet.count({
            where: {
                ubid
            }
        });
        if (isUsed > 0) {
            if (!force) 
                throw new ConflictError("baureiheBereitsVerwendet").replace("%d", isUsed.toString()).replace("%s", ubid);
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
        if (success == 0) throw new NotFoundError("baureihe");
    }

    /**
     * Baureihe ändern
     * @param ubid Indikator welche Baureihe geändert werden soll
     * @param name Neuer Name
     * @param beschreibung Neue Beschreibung
     * @throws NotFoundError
     */
    public static async edit(ubid: string, name: string, beschreibung: string) {
        const success = await Baureihe.findOne({
            where: {
                ubid
            }
        });
        if (success == null) throw new NotFoundError("baureihe");
        success.setDataValue("name", name);
        success.setDataValue("beschreibung", beschreibung);
        await success.save();
    }
}