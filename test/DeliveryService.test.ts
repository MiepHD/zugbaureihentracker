import { expect, test, beforeAll, afterAll } from 'vitest';
import { Server } from '../backend/Server.js';
import http from 'http';

//Werk von Lia

const paths: string[] = ["", "login", "registrieren", "home", "suchergebnis"];
let server: any;

beforeAll(async () => {
    server = new Server();
    await new Promise<void>((resolve, reject) => {
        const maybeServer = server as any;

        if (typeof maybeServer.on === 'function') {
            maybeServer.on('listening', resolve);
            maybeServer.on('error', reject);
        } else {
            resolve();
        }
    });
});

afterAll(async () => {
    const maybeServer = server as any;

    if (typeof maybeServer.close === 'function') {
        await new Promise<void>((resolve, reject) => {
            maybeServer.close((error: Error | undefined) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
});

for (const path of paths) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const statusCode = await new Promise<number>((resolve, reject) => {
            http.get(`http://localhost:3000/${path}/`, (res) => {
                resolve(res.statusCode || 0);
            }).on('error', reject);
        });

        expect(statusCode).toBe(200);
    });
}
