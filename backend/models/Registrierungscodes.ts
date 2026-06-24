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
     * @throws Code bereits registriert.
     * @throws Code konnte nicht hinzugefügt werden.
     */
    public static async add(code: string): Promise<void> {
        if (await Registrierungscodes.count({where: {code}}) > 0) throw Error("Code bereits registriert.");
        const entry = await Registrierungscodes.create({
            code
        });
        if (entry == null) throw Error("Code konnte nicht hinzugefügt werden.");
    }
}
