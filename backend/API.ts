import { Sequelize, DataTypes, Model, UUIDV4 } from 'sequelize';
import { Nutzer } from './models/Nutzer';
import { Freundesliste } from './models/Freundesliste';
import { Baureihe } from './models/Baureihe';
import { Aktivitaet } from './models/Aktivitaet';

class API {
    
    private nutzer: Nutzer;
    private freundesliste: Freundesliste;
    private baureihe: Baureihe;
    private aktivitaet: Aktivitaet;
    private sequelize: Sequelize;
    
    constructor() {
        const sequelize = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'mariadb'
        });
        this.sequelize = sequelize;
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
        Nutzer.belongsToMany(Nutzer, { through: Freundesliste });

        Baureihe.init({
            ubid: {
                type: DataTypes.UUIDV4,
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
            ubid: {
                type: DataTypes.UUIDV4,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            uuid: {
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
        Nutzer.belongsToMany(Baureihe, { through: Aktivitaet });
    }

    public async baureiheAlsGefundenMarkieren(sessiontoken: String, ubid: String): boolean {
        
    }

    public async getBaureihe(): Baureihe {

    }

    public async anmelden(name: String, passworthash: String): Promise<boolean | String> {
        const test = await Nutzer.count({
            where: {
                name: name,
                passworthash: passworthash,
            }
        });
        if(test == 0) return false;
        if(test > 1) throw new Error("Nutzer doppelt vorhanden.");
        
    }

    public async fuegeFreundHinzu(sessiontoken: String, uuid: String): Promise<boolean> {
        const uuid2 = await this.getNutzer(sessiontoken);
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

    public async entferneFreund(sessiontoken: String, uuid: String): Promise<boolean> {
        const uuid2 = await this.getNutzer(sessiontoken);
        const t = await this.sequelize.transaction();
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

    public async getRanking(sessiontoken: String): Ranking {
        
    }

    public async getGefundeneBaureihen(sessiontoken: String): Promise<Baureihe[]> {
        const uuid = await this.getNutzer(sessiontoken);
        return Aktivitaet.findAll({
            where: {
                uuid: uuid,
            },
            include: [Baureihe]
        });
    }

    public async getGesamtzahlBaureihen(): Promise <number> {
        return Baureihe.count();
    } 

    private async getNutzer(sessiontoken: String): Promise<String> {
        const nutzer = await Nutzer.findAll({
            where: {
                sessiontoken: sessiontoken,
            },
        });
        if (nutzer.length > 0) return nutzer[0].getDataValue("uuid"); else throw new Error("not found");
    }
}