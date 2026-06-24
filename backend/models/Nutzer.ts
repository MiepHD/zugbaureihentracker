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
                sessiontoken: sessiontoken,
            },
        });
        if (!nutzer) throw new Error("Zu diesem Sessiontoken konnte kein Nutzer gefunden werden.");
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
        if(test > 0) throw new Error("Nutzername existiert schon.");
        if(testcode < 1) throw new Error("Code ungültig.");
        const entry: Nutzer = await Nutzer.create({
            uuid: randomUUID(),
            name: name,
            passworthash: passworthash,
        });
        if (!entry) throw new Error("Nutzer konnte nicht erstellt werden.")
        const isDestroyed = await Registrierungscodes.destroy({
            where: {
                code
            }
        });
        if (isDestroyed < 1) console.warn("Registrierungscode konnte nach erfolgreicher Registrierung nicht gelöscht werden.");
        await this.sequelize?.sync();
        if(entry == null) throw new Error("Registrieren nicht möglich.");
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
        if(test == 0) throw new Error("Nutzername oder Passwort falsch.");
        if(test > 1) console.warn(`Der Benutzer "${name}" ist doppelt vorhanden.`);
        const entry = await Nutzer.findOne({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(!entry) throw new Error("Nutzer konnte nicht aus Datenbank gelesen werden.");
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

    public static async isElevated(sessiontoken: string): Promise<boolean> {
        const test = await Nutzer.count({
            where: {
                sessiontoken,
                admin: true
            }
        });
        return test != 0;
    }
}