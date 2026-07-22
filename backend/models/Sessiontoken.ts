import { DataTypes, Sequelize, UniqueConstraintError } from "sequelize";
import { Table } from "./Table";
import { Nutzer } from "./Nutzer";
import { randomUUID } from "crypto";

export class Sessiontoken extends Table {
    public static initialize(sequelize: Sequelize) {
        Sessiontoken.init({
            uuid: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: Nutzer,
                    key: 'uuid',
                },
            },
            sessiontoken: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true,
            }
        },
        {
            sequelize,
            modelName: 'Sessiontoken',
        });
    }

    public static initRelations() {
        Sessiontoken.belongsTo(Nutzer, {
            foreignKey: "uuid"
        });
    }

    /**
     * @throws ConflictError
     */
    public static async add(uuid: string): Promise<string> {
        try {
            const sessiontoken = randomUUID();
            await Sessiontoken.create({
                uuid,
                sessiontoken
            });
            return sessiontoken;
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) {
                return this.add(uuid);
            }
            throw e;
        }
    }

    public static async isValidSessiontoken(sessiontoken: string): Promise<boolean> {
        const test = await Sessiontoken.count({
            where: {
                sessiontoken
            }
        });
        return test != 0;
    }
}