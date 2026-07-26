import { DataTypes, Sequelize, UniqueConstraintError } from "sequelize";
import { Table } from "./Table";
import { Baureihe } from "./Baureihe";
import { ConflictError } from "../error/ConflictError";
import { NotFoundError } from "../error/NotFoundError";

export class Beschreibung extends Table {
    public static initialize(sequelize: Sequelize): void {
        Beschreibung.init({
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true
            },
            besitzer: {
                type: DataTypes.STRING,
            },
            vmax: {
                type: DataTypes.STRING,
            },
            baujahre: {
                type: DataTypes.STRING,
            },
            gewicht: {
                type: DataTypes.STRING,
            }
        },
        {
            sequelize,
            modelName: 'Beschreibung',
        });
    }

    public static async getAll(): Promise<Beschreibung[]> {
        return await Beschreibung.findAll({
            attributes: ["name"]
        });
    }

    public static async add(name: string, besitzer: string, vmax: string, baujahre: string, gewicht: string): Promise<void> {
        try {
            await Beschreibung.create({
                name,
                besitzer,
                vmax,
                baujahre,
                gewicht
            });
        } catch (e: unknown) {
            if (e instanceof UniqueConstraintError) throw new ConflictError("beschreibungExistiert");
            throw e;
        }
    }

    public static async remove(name: string, force: boolean): Promise<void> {
        const isUsed: number = await Baureihe.count({
            where: {
                beschreibung: name
            }
        });
        if (isUsed > 0) {
            if (!force) 
                throw new ConflictError("beschreibungGenutzt").replace("%d", isUsed.toString()).replace("%s", name);
            await Baureihe.update({
                beschreibung: null
            }, {
                where: {
                    beschreibung: name
                }
            });
        }
        const success = await Beschreibung.destroy({
            where: {
                name
            }
        });
        if (success == 0) throw new NotFoundError("beschreibung");
    }

    public static async edit(name: string, besitzer: string, vmax: string, baujahre: string, gewicht: string) {
        const success = await Beschreibung.findOne({
            where: {
                name
            }
        });
        if (success == null) throw new NotFoundError("beschreibung");
        success.setDataValue("besitzer", besitzer);
        success.setDataValue("vmax", vmax);
        success.setDataValue("baujahre", baujahre);
        success.setDataValue("gewicht", gewicht);
        await success.save();
    }

    public static async get(name: string): Promise<Baureihe> {
        const beschreibung = await Beschreibung.findOne({
            where: {
                name,
            }
        });
        if (!beschreibung) throw new NotFoundError("beschreibung");
        return beschreibung;
    }
}