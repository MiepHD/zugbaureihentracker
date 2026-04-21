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
    
    constructor() {

    Nutzer.init({
        uuid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
        },
        passworthash: {
            type: DataTypes.STRING,
        },
        sessiontoken: {
            type: DataTypes.STRING,
        }


    },
    {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: 'User', // We need to choose the model name
    },
    );
    }


    
    
}