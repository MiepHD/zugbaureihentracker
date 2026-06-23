import { Sequelize } from 'sequelize';
import { Nutzer } from './models/Nutzer';
import { Freundesliste } from './models/Freundesliste';
import { Baureihe } from './models/Baureihe';
import { Aktivitaet } from './models/Aktivitaet';
import { Registrierungscodes } from './models/Registrierungscodes';
import { Table } from './models/Table';

export class Database {
    private sequelize: Sequelize;
    public registrierungscodes: typeof Registrierungscodes;
    public nutzer: typeof Nutzer;
    public freundesliste: typeof Freundesliste;
    public baureihe: typeof Baureihe;
    public aktivitaet: typeof Aktivitaet;
    
    /**
     * Konstruktor der Klasse Api; Erstellen des Sequelize zur Kommunikation mit der Datenbank; Erstellen der Tabellen
     * @author Tim & Lia
     * @since 24.04.2026
     */
    constructor(sequelize: Sequelize) {
        this.sequelize = sequelize;
        this.registrierungscodes = Registrierungscodes;
        this.nutzer = Nutzer;
        this.freundesliste = Freundesliste;
        this.baureihe = Baureihe;
        this.aktivitaet = Aktivitaet;
    }

    /**
     * Initialisiert die Tabellen und Relations der Datenbank
     * @author Tim & Lia
     */
    async init(){
        const models: typeof Table[] = [this.registrierungscodes, this.nutzer, this.freundesliste, this.baureihe, this.aktivitaet];
        for (const model of models) {
            model.initialize(this.sequelize);
        }
        for (const model of models) {
            model.initRelations();
        }
        await this.sequelize.sync({alter: true});
    }

    public async baureihenVonFreundenAbrufen(sessiontoken: string): Promise<Nutzer | null> {
        return await Nutzer.findOne({
            where: {
                sessiontoken: sessiontoken,
            },
            // Wir wollen nur die Freunde und deren Daten, nicht die Daten des anfragenden Nutzers selbst
            attributes: ["uuid"], 
            include: [
                {
                    model: Nutzer,
                    as: 'Freunde',
                    // Schließt die IDs aus der Freundesliste-Zwischentabelle (von/zu) aus den Rohdaten aus
                    through: { attributes: ["von", "zu"] }, 
                    // Hier wählen wir nur den Namen des Freundes aus, den du anzeigen möchtest
                    attributes: ['name', 'uuid'], 
                    include: [
                        {
                            model: Aktivitaet,
                            // Verhindert, dass leere Freunde (die keine Aktivität haben) im Ergebnis auftauchen
                            required: false, 
                            attributes: ["ubid"], // Wir brauchen die IDs der Aktivitätstabelle nicht im Endergebnis
                        }
                    ]
                }
            ]
        });
    }

    /**
     * Gibt eine Liste an allen on einem Nutzer gefundenen Baureihen zurück.
     * @author Tim & Lia
     * @since 28.04.2026
     * @param sessiontoken Sessiontoken eines Nutzers.
     * @returns Liste mit allen Einträgen der Tabelle Baureihe.
     */
    public async getGefundeneBaureihen(sessiontoken: string): Promise<Baureihe[]> {
        const uuid = await Nutzer.getNutzer(sessiontoken);
        return Aktivitaet.findAll({
            where: {
                uuid: uuid,
            },
            include: [Baureihe]
        });
    }
}