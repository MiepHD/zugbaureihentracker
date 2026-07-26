import { DataTypes, Sequelize, UniqueConstraintError } from 'sequelize';

import { Table } from './Table';

import { ConflictError } from '../error/ConflictError';

export class Registrierungscodes extends Table {
    public static initialize(sequelize: Sequelize) {
        Registrierungscodes.init({
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true,
            }
        },
        {
            sequelize,
            modelName: 'Registrierungscodes',
        });
    }

    /**
     * Einen Einladungscode hinzufügen
     * @throws ConflictError
     */
    public static async add(code: string): Promise<void> {
        try {
            await Registrierungscodes.create({ code });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) throw new ConflictError("codeExists");
            throw e;
        }
    }
}
