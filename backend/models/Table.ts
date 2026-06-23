import { Model, Sequelize } from "sequelize";

export class Table extends Model {
    public static initialize(sequelize: Sequelize): void {};
    public static initRelations(sequelize: Sequelize): void {};
}