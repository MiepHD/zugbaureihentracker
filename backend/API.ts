import { Sequelize, DataTypes, Model } from 'sequelize';
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

    public baureiheAlsGefundenMarkieren(sessiontoken: String, ubid: String): boolean {
        
    }

    public getBaureihe(): Baureihe {

    }

    public anmelden(name: String, passworthash: String): boolean {

    }

    public fuegeFreundHinzu(sessiontoken: String, uuid: String): boolean {

    }

    public entferneFreund(sessiontoken: String, uuid: String): boolean {

    }

    public getRanking(sessiontoken: String): Ranking {
        
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