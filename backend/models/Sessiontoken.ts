import { DataTypes, Op, Sequelize, UniqueConstraintError } from "sequelize";
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
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
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
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            await Sessiontoken.create({
                uuid,
                sessiontoken,
                expiresAt
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
        await Sessiontoken.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        })
        const test = await Sessiontoken.count({
            where: {
                sessiontoken
            }
        });
        return test != 0;
    }
}