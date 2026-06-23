import { DataTypes, Sequelize } from 'sequelize';
import { Table } from './Table';

export class Registrierungscodes extends Table {
    public static initialize(sequelize: Sequelize) {
        Registrierungscodes.init({
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            }
        },
        {
            sequelize,
            modelName: 'Registrierungscodes',
        });
    }
}
