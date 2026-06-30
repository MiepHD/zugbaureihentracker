import { Sequelize, DataTypes, UniqueConstraintError } from 'sequelize';
import { randomUUID } from 'crypto';

import { Freundesliste } from './Freundesliste';
import { Aktivitaet } from './Aktivitaet';
import { Table } from './Table';
import { Registrierungscodes } from './Registrierungscodes';

import { NotFoundError } from '../error/NotFoundError';
import { ConflictError } from '../error/ConflictError';
import { UnauthorizedError } from '../error/UnauthorizedError';

export class Nutzer extends Table {
    public static initialize(sequelize: Sequelize) {
        Nutzer.init({
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            passworthash: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            sessiontoken: {
                type: DataTypes.STRING,
            },
            admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'Nutzer',
        });
    }

    public static initRelations() {
        Nutzer.belongsToMany(Nutzer, {
            as: "Freunde",
            through: Freundesliste,
            foreignKey: {
                name: "von",
                allowNull: false
            },
            otherKey: {
                name: "zu",
                allowNull: false
            }
        });
        Nutzer.belongsToMany(Nutzer, {
            as: "WirdGefolgtVon",
            through: Freundesliste,
            foreignKey: {
                name: "zu",
                allowNull: false
            },
            otherKey: {
                name: "von",
                allowNull: false
            }
        });
        Nutzer.hasMany(Aktivitaet, {
            foreignKey: "uuid"
        });
    }


    /**
     * Sucht einen Nutzer zu einem Sessiontoken.
     * @author Tim & Lia
     * @since 28.04.2026
     * @throws UnauthorizedError
     */
    static async getNutzer(sessiontoken: string): Promise<Nutzer> {
        const nutzer = await Nutzer.findOne({
            where: {
                sessiontoken,
            },
        });
        if (!nutzer) throw new UnauthorizedError("invalidSession");
        return nutzer;
    }

    /**
     * @author Tim & Lia
     * @since 28.04.2026
     * @throws NotFoundError
     */
    static async getNutzerByUUID(uuid: string): Promise<Nutzer> {
        const nutzer = await Nutzer.findOne({
            where: { uuid }
        });
        if (!nutzer) throw new NotFoundError("uuid");
        return nutzer;
    }


    /**
     * Registrieren eines Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param code Registrierungscode
     * @throws NotFoundError
     * @throws ConflictError
     */
    public static async add(name: string, passworthash: string, code: string): Promise<void> {
        const testcode: number = await Registrierungscodes.count({
            where: { code }
        });
        if(testcode < 1) throw new NotFoundError("registrierungscode");
        try {
            const uuid = randomUUID();
            await Nutzer.create({
                uuid,
                name,
                passworthash,
            });

            await Registrierungscodes.destroy({
                where: { code }
            });
            await Freundesliste.create({
                von: uuid,
                zu: uuid,
                isComplete: true
            });
            
            await this.sequelize?.sync();
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) {
                const errors = e.fields;
                if ("uuid" in errors) {
                    await Nutzer.add(name, passworthash, code);
                    return;
                }
                if ("name" in errors) {
                    throw new ConflictError("nutzername");
                }
            }
            throw e;
        }
    }

    /**
     * Anmelden des Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @returns Gibt das neu vergebene Sessiontoken zurück.
     * @throws NotFoundError
     */
    public static async getSessiontoken(name: string, passworthash: string): Promise<string> {
        const entry = await Nutzer.findOne({
            where: {
                name,
                passworthash,
            }
        });
        if(!entry) throw new NotFoundError("login");
        const sessiontoken: string = randomUUID();
        entry.setDataValue("sessiontoken", sessiontoken);
        await entry.save();
        return sessiontoken;
    }

    /**
     * @throws NotFoundError
     */
    public static async getUUID(sessiontoken: string): Promise<string> {
        const user = await this.getNutzer(sessiontoken);
        return await user.getDataValue("uuid");
    }

    /**
     * Vergibt Adminrechte an den zugehörigen Nutzer
     * @throws NotFoundError
     */
    public static async elevate(sessiontoken: string): Promise<void> {
        const user = await this.getNutzer(sessiontoken);
        user.setDataValue("admin", true);
        await user.save();
    }

    /**
     * Vergibt Adminrechte an diese UUID
     * @throws NotFoundError
     */
    public static async elevateByUUID(uuid: string): Promise<void> {
        const user = await this.getNutzerByUUID(uuid);
        user.setDataValue("admin", true);
        await user.save();
    }

    public static async isElevated(sessiontoken: string): Promise<boolean> {
        const test = await Nutzer.count({
            where: {
                sessiontoken,
                admin: true
            }
        });
        return test != 0;
    }

    /**
     * @returns Alle registrierten Nutzer mit UUID, Name und Adminstatus
     */
    public static async getAll(): Promise<Nutzer[]> {
        return await Nutzer.findAll({
            attributes: ["uuid", "name", "admin"]
        });
    }

    /**
     * Nutzer löschen
     * Der Nutzer darf kein Admin sein
     * @param force Erzwingt die Löschung, indem alle zugehörigen Daten ebenfalls gelöscht werden
     * @throws ConflictError
     * @throws NotFoundError
     */
    public static async remove(uuid: string, force: boolean): Promise<void> {
        if (force) {
            await Aktivitaet.destroy({
                where: { uuid }
            });
            await Freundesliste.destroy({
                where: { von: uuid }
            });
            await Freundesliste.destroy({
                where: { zu: uuid }
            });
        } else {
            const isUsed = await Aktivitaet.count({
                where: { uuid }
            });
            const isUsed2 = await Freundesliste.count({
                where: { von: uuid }
            });
            const isUsed3 = await Freundesliste.count({
                where: { zu: uuid }
            });
            if (isUsed > 0 || isUsed2 > 0 || isUsed3 > 0)
                throw new ConflictError("kontoBereitsVerwendet")
                    .replace("%d", isUsed.toString())
                    .replace("%d", isUsed3.toString())
                    .replace("%d", isUsed2.toString());
        }
        
        const count = await Nutzer.destroy({
            where: {
                uuid,
                admin: false
            }
        });
        if (count == 0) throw new NotFoundError("unelevatedUser");
    }

    /**
     * @throws NotFoundError
     */
    public static async removeAdmin(uuid: string): Promise<void> {
        const nutzer = await Nutzer.getNutzerByUUID(uuid);
        nutzer.setDataValue("admin", false);
        await nutzer.save();
    }
}