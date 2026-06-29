import { Sequelize, DataTypes } from 'sequelize';
import { Freundesliste } from './Freundesliste';
import { Aktivitaet } from './Aktivitaet';
import { Table } from './Table';
import { Registrierungscodes } from './Registrierungscodes';
import { randomUUID } from 'crypto';

export class Nutzer extends Table {
    public static initialize(sequelize: Sequelize) {
        Nutzer.init({
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
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
     * @param sessiontoken Sessiontoken eines Nutzers
     * @returns Gibt die UUID vom Nutzer zurück.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    static async getNutzer(sessiontoken: string): Promise<Nutzer> {
        const nutzer = await Nutzer.findOne({
            where: {
                sessiontoken,
            },
        });
        if (!nutzer) throw new Error("Zu diesem Sessiontoken konnte leider kein Nutzer gefunden werden.");
        return nutzer;
    }

    /**
     * Sucht einen Nutzer zu einem Sessiontoken.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers
     * @returns Gibt die UUID vom Nutzer zurück.
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    static async getNutzerByUUID(uuid: string): Promise<Nutzer> {
        const nutzer = await Nutzer.findOne({
            where: {
                uuid,
            },
        });
        if (!nutzer) throw new Error("Zu dieser UUID konnte leider kein Nutzer gefunden werden.");
        return nutzer;
    }


    /**
     * Registrieren eines Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param name Benutzername des Nutzers.
     * @param passworthash Passworthash des Nutzers.
     * @returns True or False, ob das Registrieren funktioniert hat.
     * @throws Nutzername existiert schon.
     * @throws Code ungültig.
     * @throws Nutzer konnte nicht erstellt werden.
     */
    public static async add(name: string, passworthash: string, code: string): Promise<void> {
        const test: number = await Nutzer.count({
            where: {
                name: name,
            }
        });
        const testcode: number = await Registrierungscodes.count({
            where: {
                code
            }
        });
        if(test > 0) throw new Error("Dieser Nutzername ist bereits vergeben.");
        if(testcode < 1) throw new Error("Der Registrierungscode ist ungültig.");
        const uuid = randomUUID();
        const entry: Nutzer = await Nutzer.create({
            uuid,
            name: name,
            passworthash: passworthash,
        });
        if (!entry) throw new Error("Der Nutzer konnte leider nicht erstellt werden.");
        const freundschaft = await Freundesliste.create({
            von: uuid,
            zu: uuid,
            isComplete: true
        });
        if (!freundschaft) console.warn("Freundschaft mit sich selbst konnte bei Registrierung nicht erstellt werden.");
        const isDestroyed = await Registrierungscodes.destroy({
            where: {
                code
            }
        });
        if (isDestroyed < 1) console.warn("Registrierungscode konnte nach erfolgreicher Registrierung nicht gelöscht werden.");
        await this.sequelize?.sync();
        if(entry == null) throw new Error("Das Registrieren war leider nicht möglich.");
    }

    /**
     * Anmelden des Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param name Benutzername des Nutzers.
     * @param passworthash Passworthash des Nutzers.
     * @returns Gibt das neu vergebene Sessiontoken zurück.
     * @throws Nutzername oder Passwort falsch.
     * @throws Nutzer konnte nicht aus Datenbank gelesen werden.
     */
    public static async getSessiontoken(name: string, passworthash: string): Promise<string> {
        const test = await Nutzer.count({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(test == 0) throw new Error("Der Nutzername oder das Passwort ist falsch.");
        if(test > 1) console.warn(`Der Benutzer "${name}" ist doppelt vorhanden.`);
        const entry = await Nutzer.findOne({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(!entry) throw new Error("Der Nutzer konnte leider nicht aus der Datenbank gelesen werden.");
        const sessiontoken: string = randomUUID();
        entry.setDataValue("sessiontoken", sessiontoken);
        await entry.save();
        return sessiontoken;
    }

    /**
     * 
     * @param sessiontoken 
     * @returns 
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    public static async getUUID(sessiontoken: string): Promise<string> {
        const user = await this.getNutzer(sessiontoken);
        return await user.getDataValue("uuid");
    }

    /**
     * 
     * @param sessiontoken 
     * @throws Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.
     */
    public static async elevate(sessiontoken: string): Promise<void> {
        const user = await this.getNutzer(sessiontoken);
        user.setDataValue("admin", true);
        await user.save();
    }

    /**
     * 
     * @param sessiontoken 
     * @throws Zu dieser UUID konnte kein Nutzer gefunden werden.
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

    public static async getAll(): Promise<Nutzer[]> {
        return await Nutzer.findAll();
    }

    /**
     * 
     * @param uuid 
     * @throws Dieser Nutzer existiert nicht.
     * @throws Nutzer konnte nicht aus Datenbank gelöscht werden.
     */
    public static async remove(uuid: string, force: boolean): Promise<void> {
        const existsNutzer = await Nutzer.count({
            where: {
                uuid,
                admin: false
            }
        });
        if (existsNutzer == 0) throw new Error("Dieser Nutzer existiert nicht.");
        const isUsed = await Aktivitaet.count({
            where: {
                uuid
            }
        });
        const isUsed2 = await Freundesliste.count({
            where: {
                von: uuid
            }
        });
        const isUsed3 = await Freundesliste.count({
            where: {
                zu: uuid
            }
        });
        if (isUsed > 0 || isUsed2 > 0 || isUsed3 > 0) {
            if (!force) throw new Error(`Dieser Account hat bereits ${isUsed} Baureihen gefunden, wurde von ${isUsed3} Freunden hinzugefügt und hat ${isUsed2} Freunde hinzugefügt. Willst Du ihn trotzdem löschen?`);
            await Aktivitaet.destroy({
                where: {
                    uuid
                }
            });
            await Freundesliste.destroy({
                where: {
                    von: uuid
                }
            });
            await Freundesliste.destroy({
                where: {
                    zu: uuid
                }
            });
        }
        const count = await Nutzer.destroy({
            where: {
                uuid,
                admin: false
            }
        });
        if (count == 0) throw new Error("Der Nutzer konnte leider nicht aus der Datenbank gelöscht werden.");
    }

    /**
     * 
     * @param uuid 
     * @throws Dieser Nutzer existiert nicht.
     * @throws Nutzer konnte nicht gefunden werden.
     */
    public static async removeAdmin(uuid: string): Promise<void> {
        const existsNutzer = await Nutzer.count({
            where: {
                uuid
            }
        });
        if (existsNutzer == 0) throw new Error("Dieser Nutzer existiert nicht.");
        const nutzer = await Nutzer.findOne({
            where: {
                uuid
            }
        });
        if (nutzer == null) throw new Error("Dieser Nutzer konnte nicht gefunden werden.");
        nutzer.setDataValue("admin", false);
        await nutzer.save();
    }
}