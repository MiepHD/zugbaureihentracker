import { Request, Response } from "express";
import { API } from "../API";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

import { Nutzer } from "../models/Nutzer";
import { Beschreibung as DBBeschreibung } from "../models/Beschreibung";
import { ForbiddenError } from "../error/ForbiddenError";
import { ValidationError } from "../error/ValidationError";

export class Beschreibung {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(__dirname, "../../frontend/data/fotos");

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // Bestimmt den Dateipfad unter Verwendung des Attributs uploadDir
    private getImagePath(name: string): string {
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
        return path.join(this.uploadDir, `${safeName}.webp`);
    }

    // Speichert und konvertiert das Bild zu WebP
    private async saveImageAsWebp(name: string, buffer: Buffer): Promise<void> {
        const targetPath = this.getImagePath(name);
        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(targetPath);
    }

    // Löscht das Bild, falls es existiert
    private removeImageIfExists(name: string): void {
        const filePath = this.getImagePath(name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    async getAll(req: Request, res: Response) {
        await API.try(req, res, true, async (ignored, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("getAllBeschreibungen");
            res.send(`${JSON.stringify(await DBBeschreibung.getAll())}`);
        });
    }

    async add(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("addBeschreibung");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.besitzer)) throw new ValidationError("besitzer");
            if (!API.isValidString(data.vmax)) throw new ValidationError("vmax");
            if (!API.isValidString(data.baujahre)) throw new ValidationError("baujahre");
            if (!API.isValidString(data.gewicht)) throw new ValidationError("gewicht");

            if (req.file && req.file.buffer) {
                await this.saveImageAsWebp(data.name, req.file.buffer);
            }

            await DBBeschreibung.add(data.name, data.besitzer, data.vmax, data.baujahre, data.gewicht);
            res.send(`{ "successMessage": "Beschreibung wurde erfolgreich erstellt." }`);
            console.log(`Es wurde eine neue Beschreibung hinzugefügt mit dem Namen: ${data.name}`);
        });
    }

    async remove(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            let force = false;
            if (data.force) force = true;
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("removeBeschreibung");
            if (!API.isValidString(data.name)) throw new ValidationError("name");

            this.removeImageIfExists(data.name);

            await DBBeschreibung.remove(data.name, force);
            res.send(`{ "successMessage": "Beschreibung wurde erfolgreich gelöscht." }`);
            console.log(`Es wurde die Beschreibung mit dem Namen ${data.name} gelöscht.`);
        });
    }

    async edit(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("editBeschreibung");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            if (!API.isValidString(data.besitzer)) throw new ValidationError("besitzer");
            if (!API.isValidString(data.vmax)) throw new ValidationError("vmax");
            if (!API.isValidString(data.baujahre)) throw new ValidationError("baujahre");
            if (!API.isValidString(data.gewicht)) throw new ValidationError("gewicht");
            
            if (req.file && req.file.buffer) {
                this.removeImageIfExists(data.name);
                await this.saveImageAsWebp(data.name, req.file.buffer);
                console.log(`Das Bild für die Beschreibung ${data.name} wurde geändert.`);
            }

            await DBBeschreibung.edit(data.name, data.besitzer, data.vmax, data.baujahre, data.gewicht);
            res.send(`{ "name": "${data.name}", "successMessage": "Baureihe wurde erfolgreich geändert." }`);
            console.log(`Die Beschreibung "${data.name}" wurde geändert.`);
        });
    }

    async removeImage(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("removeImageBeschreibung");
            if (!API.isValidString(data.name)) throw new ValidationError("name");

            this.removeImageIfExists(data.name);

            res.send(`{ "successMessage": "Bild der Beschreibung wurde erfolgreich gelöscht." }`);
            console.log(`Das Bild für die Beschreibung "${data.name}" wurde gelöscht.`);
        });
    }

    async get(req: Request, res: Response) {
        await API.try(req, res, true, async (data, sessiontoken) => {
            if (!await Nutzer.isElevated(sessiontoken as string)) throw new ForbiddenError("getBeschreibung");
            if (!API.isValidString(data.name)) throw new ValidationError("name");
            res.send(`{
                "beschreibung": ${JSON.stringify(await DBBeschreibung.get(data.name as string))}
            }`);
        });
    }
}