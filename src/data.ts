import { Injectable } from "@angular/core";
import { parse } from "csv-rex";

@Injectable({
    providedIn: "root",
})
export class Data {
    getDB = (): Promise<IDBDatabase> =>
        new Promise((resolve, reject) => {
            const request = indexedDB.open("screenshots");
            request.onupgradeneeded = () => {
                request.result.createObjectStore("data", { keyPath: "key" });
            };
            request.onsuccess = () => {
                console.log("Database opened.");
                resolve(request.result);
            };
            request.onerror = () => {
                console.error("Error opening database:", request.error);
                reject(request.error);
            };
        });

    getFromDB = (db: IDBDatabase, key: string): Promise<any> =>
        new Promise((resolve, reject) => {
            const request = db
                .transaction("data", "readonly")
                .objectStore("data")
                .get(key);
            request.onsuccess = () => {
                const result = request.result?.value;
                if (result) {
                    console.log(
                        `Data retrieved successfully for key ${key}:`,
                        result
                    );
                } else {
                    console.warn(`No data found for key ${key}.`);
                }
                resolve(result || null);
            };
            request.onerror = () => {
                console.error(
                    `Error retrieving data for key: ${key}.`,
                    request.error
                );
                reject(request.error);
            };
        });

    storeInDB = (db: IDBDatabase, key: string, value: any): Promise<void> =>
        new Promise((resolve, reject) => {
            const request = db
                .transaction("data", "readwrite")
                .objectStore("data")
                .put({ key, value });
            request.onsuccess = () => {
                console.log(`Data stored successfully for key: ${key}.`);
                resolve();
            };
            request.onerror = () => {
                console.error(
                    `Error storing data for key: ${key}.`,
                    request.error
                );
                reject(request.error);
            };
        });

    deleteDB = (): Promise<void> =>
        new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase("screenshots");
            request.onsuccess = () => {
                console.log("Database deleted successfully");
                resolve();
            };
            request.onerror = () => {
                console.error("Error deleting database:", request.error);
                reject(request.error);
            };
        });

    async checkDB(): Promise<Map<string, string[]> | null> {
        if ((await indexedDB.databases()).some(db => db.name === "screenshots"))
            return this.getFromDB(await this.getDB(), "data");
        return null;
    }

    async getData(): Promise<Map<string, string[]> | null> {
        try {
            const handle = (
                await window.showOpenFilePicker({
                    types: [
                        {
                            description: "TSV Files",
                            accept: { "text/tab-separated-values": [".tsv"] },
                        },
                    ],
                })
            )[0];
            const text = await (await handle.getFile()).text();
            const dataMap = parse(text, {
                delimiter: "\t",
                headers: true,
            }).reduce(
                (
                    acc: Map<string, string[]>,
                    { game, id, description }: any
                ) => {
                    const gameData = acc.get(game) || [];
                    gameData[id] = description;
                    acc.set(game, gameData);
                    return acc;
                },
                new Map<string, string[]>()
            );
            const db = await this.getDB();
            await Promise.all([
                this.storeInDB(db, "handle", handle),
                this.storeInDB(db, "data", dataMap),
            ]);
            return dataMap;
        } catch {
            return null;
        }
    }

    async addData(
        name: string,
        id: number = 0,
        description: string = "poster"
    ): Promise<void> {
        const db = await this.getDB();
        const [data, handle] = await Promise.all([
            this.getFromDB(db, "data"),
            this.getFromDB(db, "handle"),
        ]);
        const writable = await handle.createWritable();
        await writable.write(
            await(await handle.getFile()).text() +
                `${name}\t${id}\t${description}\n`
        );
        await writable.close();
        await this.storeInDB(
            db,
            "data",
            new Map(data).set(name, [description])
        );
    }
}
