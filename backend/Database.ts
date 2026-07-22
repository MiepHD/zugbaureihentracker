import { Sequelize } from 'sequelize';
import { Nutzer } from './models/Nutzer';
import { Freundesliste } from './models/Freundesliste';
import { Baureihe } from './models/Baureihe';
import { Aktivitaet } from './models/Aktivitaet';
import { Registrierungscodes } from './models/Registrierungscodes';
import { Table } from './models/Table';
import { Beschreibung } from './models/Beschreibung';
import { Sessiontoken } from './models/Sessiontoken';

export class Database {
    private sequelize: Sequelize;

    /**
     * Dieses Attribut sind nur für Tests
     */
    public registrierungscodes: typeof Registrierungscodes;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public nutzer: typeof Nutzer;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public freundesliste: typeof Freundesliste;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public baureihe: typeof Baureihe;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public aktivitaet: typeof Aktivitaet;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public beschreibung: typeof Beschreibung;
    /**
     * Dieses Attribut sind nur für Tests
     */
    public sessiontoken: typeof Sessiontoken;
    
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
        this.beschreibung = Beschreibung;
        this.sessiontoken = Sessiontoken;
    }

    /**
     * Initialisiert die Tabellen und Relations der Datenbank
     * @author Tim & Lia
     */
    async init(){
        const models: typeof Table[] = [this.registrierungscodes, this.nutzer, this.freundesliste, this.baureihe, this.aktivitaet, this.beschreibung, this.sessiontoken];
        for (const model of models) {
            model.initialize(this.sequelize);
        }
        for (const model of models) {
            model.initRelations();
        }
        await this.sequelize.sync({alter: true});
    }
}