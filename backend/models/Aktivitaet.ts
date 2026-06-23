import { Sequelize,DataTypes } from 'sequelize';
import { Nutzer } from './Nutzer';
import { Baureihe } from './Baureihe';
import { Table } from './Table';

export class Aktivitaet extends Table {
    public static initialize(sequelize: Sequelize) {
        Aktivitaet.init({
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            ubid: {
                type: DataTypes.STRING,
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
    }

    public static initRelations() {
        Aktivitaet.belongsTo(Baureihe, {
            foreignKey: "ubid"
        });
        Aktivitaet.belongsTo(Nutzer, {
            foreignKey: "uuid"
        });
    }
}