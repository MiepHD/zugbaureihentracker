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

    /**
     * Einen Einladungscode hinzufügen
     */
    public static async add(code: string): Promise<boolean> {
        if (await Registrierungscodes.count({where: {code}}) > 0) return false;
        const entry = await Registrierungscodes.create({
            code
        });
        return entry != null;
    }
}
