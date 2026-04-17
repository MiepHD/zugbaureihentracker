import { Sequelize, DataTypes, Model } from 'sequelize';
import { Nutzer } from './models/Nutzer';

class API {
    private nutzer: Nutzer;
    constructor() {

    User.init({
        // Model attributes are defined here
        firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        },
        lastName: {
        type: DataTypes.STRING,
        // allowNull defaults to true
        },
    },
    {
        // Other model options go here
        sequelize, // We need to pass the connection instance
        modelName: 'User', // We need to choose the model name
    },
    );
    }


    
    
}