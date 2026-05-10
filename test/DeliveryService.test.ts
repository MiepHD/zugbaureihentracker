import { expect, test } from 'vitest';
import { Server } from '../backend/Server.js';
import http from 'http';


new Server();

const paths: String[] = ["", "login", "home", "ranking", "baureihen"];

for (const path of paths) {
    test(`Server responds to "${path}" directory with 200 OK`, async () => {
        const statusCode = await new Promise<number>((resolve, reject) => {
            http.get(`http://localhost:3000/${path}`, (res) => {
                resolve(res.statusCode || 0);
            }).on('error', reject);
        });
        expect(statusCode).toBe(200);
    });
}
