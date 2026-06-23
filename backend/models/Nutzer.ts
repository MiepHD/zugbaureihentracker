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
     */
    static async getNutzer(sessiontoken: string): Promise<string> {
        const nutzer = await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken,
            },
        });
        return nutzer?.getDataValue("uuid");
    }


    /**
     * Registrieren eines Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param name Benutzername des Nutzers.
     * @param passworthash Passworthash des Nutzers.
     * @returns True or False, ob das Registrieren funktioniert hat.
     */
    public static async add(name: string, passworthash: string, code: string): Promise<boolean> {
        const test: number = await Nutzer.count({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        const testcode: number = await Registrierungscodes.count({
            where: {
                code
            }
        });
        if(test > 0) throw new Error("Nutzer existiert schon.");
        if(testcode < 1) throw new Error("Code ungültig.");
        const entry: Nutzer = await Nutzer.create({
            uuid: randomUUID(),
            name: name,
            passworthash: passworthash,
        });
        await Registrierungscodes.destroy({
            where: {
                code
            }
        });
        await this.sequelize?.sync();
        if(entry != null) return true;
        throw new Error("Registrieren nicht möglich.");
    }

    /**
     * Anmelden des Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param name Benutzername des Nutzers.
     * @param passworthash Passworthash des Nutzers.
     * @returns Gibt das neu vergebene Sessiontoken zurück.
     */
    public static async getSessiontoken(name: string, passworthash: string): Promise<boolean | string> {
        const test = await Nutzer.count({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(test == 0) return false;
        if(test > 1) throw new Error("Nutzer doppelt vorhanden.");
        const entry = await Nutzer.findOne({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        const sessiontoken: string = randomUUID();
        entry?.setDataValue("sessiontoken", sessiontoken);
        await entry?.save();
        return sessiontoken;
    }

    public static async getUUID(sessiontoken: string): Promise<string> {
        const user = await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken
            }
        });
        return await user?.getDataValue("uuid");
    }
}