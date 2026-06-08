import { Sequelize, DataTypes, UUIDV4, Transaction } from 'sequelize';
import { Nutzer } from './models/Nutzer';
import { Freundesliste } from './models/Freundesliste';
import { Baureihe } from './models/Baureihe';
import { Aktivitaet } from './models/Aktivitaet';
import { randomUUID } from 'crypto';

export class Database {
    private sequelize: Sequelize;
    
    /**
     * Konstruktor der Klasse Api; Erstellen des Sequelize zur Kommunikation mit der Datenbank; Erstellen der Tabellen
     * @author Tim & Lia
     * @since 24.04.2026
     */
    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
    }

    /**
     * Initialisiert die Tabellen und Relations der Datenbank
     * @author
     * @since
     */
    async init(){
        const sequelize = this.sequelize;
        Nutzer.init({
            uuid: {
                type: DataTypes.UUIDV4,
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
            }
        },
        {
            sequelize,
            modelName: 'Nutzer',
        });

        Freundesliste.init({
            von: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            zu: {
                type: DataTypes.STRING,
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

        Baureihe.init({
            ubid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
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

        Aktivitaet.init({
            uuid: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            ubid: {
                type: DataTypes.UUIDV4,
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
        });
        Aktivitaet.belongsTo(Baureihe, {
            foreignKey: "ubid"
        });

        Aktivitaet.belongsTo(Nutzer, {
            foreignKey: "uuid"
        });
        await this.sequelize.sync();
    }

    /** Eine Baureihe als gefunden markieren, indem ein Eintrag in der Tabelle Aktivität erstellt wird.
     * @author Tim
     * @since 08.06.2026
     * @param sessiontoken 
     * @param ubid 
     */
    public async baureiheAlsGefundenMarkieren(token: string, ubid: string): Promise<boolean> {
        const uuid = await this.getNutzer(token);
        if (!uuid) {
            return false;
        }
        const baureihe = await this.getBaureihe(ubid);
        if (!baureihe) {
            return false;
        }
        const neueAktivitaet = await Aktivitaet.create({
            uuid: uuid,
            ubid: baureihe.getDataValue("ubid"),
        });
        return neueAktivitaet !== null;
}

    /**Suchen einer Baureihe aus der Datenbank und dazugehöriger Informationen.
     * @author Tim
     * @since 22.05.2026
     */
    public async getBaureihe(ubid: string): Promise<Baureihe | null> {
        return await Baureihe.findOne({
            where: {
                ubid: ubid,
            }
        });
    }

    /** Hinzufügen einer Baureihe in die Datenbank.
     * @author Lia
     * @since 22.05.2026
     */
    public async addBaureihe(ubid: string, name: string, beschreibung: string): Promise<boolean | void> {
        const test: number = await Baureihe.count({
            where: {
                ubid
            }
        });
        if (test > 0) return false;
        Baureihe.create({
            ubid,
            name,
            beschreibung
        });
        await this.sequelize.sync();
        return true;
    }

    /**
     * Registrieren eines Nutzers auf der Website.
     * @author Tim & Lia
     * @since 08.05.2026
     * @param name Benutzername des Nutzers.
     * @param passworthash Passworthash des Nutzers.
     * @returns True or False, ob das Registrieren funktioniert hat.
     */
    public async registrieren(name: string, passworthash: string): Promise<boolean> {
        const test: number = await Nutzer.count({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(test > 0) throw new Error("Nutzer existiert schon.");
        const entry: Nutzer = await Nutzer.create({
            uuid: randomUUID(),
            name: name,
            passworthash: passworthash,
        });
        await this.sequelize.sync();
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
    public async anmelden(name: string, passworthash: string): Promise<boolean | string> {
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

    /**
     * Hinzufügen eines Freundes in die Freundesliste.
     * @author Tim & Lia
     * @since 05.05.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @param uuid User ID eines Nutzers.
     * @returns True or false, on das Hinzufügen erfolgreich war.
     */
    public async fuegeFreundHinzu(sessiontoken: string, uuid: string): Promise<boolean> {
        const uuid2 = await this.getUUID(sessiontoken);
        if (!uuid2) {
            throw new Error("Nutzer nicht gefunden.");
        }
        const test = await Freundesliste.count({
            where: {
                von: uuid2,
                zu: uuid,
            }
        });
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
    public async entferneFreund(sessiontoken: string, uuid: string): Promise<boolean> {
        const uuid2: string = await this.getNutzer(sessiontoken);
        const t: Transaction = await this.sequelize.transaction();
        try {
            const exit = await Freundesliste.destroy({
                where: {
                    von: uuid2,
                    zu: uuid,
                },
                transaction: t,
            });
            if (exit > 1) {
                await t.rollback();
                throw new Error("Mehr als ein Eintrag gelöscht – Rollback durchgeführt!");
            }
            await t.commit();
            return exit === 1;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    /**
     * Gibt eine Liste an allen on einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @returns Liste mit allen Einträgen der Tabelle Baureihe.
     */
    public async getGefundeneBaureihen(sessiontoken: string): Promise<Baureihe[]> {
        const uuid = await this.getNutzer(sessiontoken);
        return Aktivitaet.findAll({
            where: {
                uuid: uuid,
            },
            include: [Baureihe]
        });
    }

    /**
     * Gibt die Gesamtzahl aller gesammelten Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @returns Zahl der gesamten Baureihen.
     */
    public async getGesamtzahlBaureihen(): Promise <number> {
        const n: number = await Baureihe.count();
        await this.sequelize.sync();
        return n;
    }

    public async getUUID(sessiontoken: string): Promise<string> {
        const user = await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken
            }
        });
        return await user?.getDataValue("uuid");
    }

    /**
     * Sucht einen Nutzer zu einem Sessiontoken.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers
     * @returns Gibt die UUID vom Nutzer zurück.
     */
    private async getNutzer(sessiontoken: string): Promise<string> {
        const nutzer = await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken,
            },
        });
        return nutzer?.getDataValue("uuid");
    }
}