import { Injectable } from "@angular/core";
import { parse } from "csv-rex";

interface Entry {
    game: string;
    id: number;
    description: string;
}

@Injectable({
    providedIn: "root",
})
export class Data {
    async getData(fromUser: boolean): Promise<Map<string, string[]> | null> {
        const initDB = (): Promise<IDBDatabase> =>
            new Promise((resolve, reject) => {
                const request = indexedDB.open("screenshots");
                request.onupgradeneeded = () =>
                    request.result.createObjectStore("data", {
                        keyPath: "key",
                    });
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        const getFromDB = (db: IDBDatabase, key: string): Promise<any> =>
            new Promise((resolve, reject) => {
                const request = db
                    .transaction("data", "readonly")
                    .objectStore("data")
                    .get(key);
                request.onsuccess = () =>
                    resolve(request.result?.value || null);
                request.onerror = () => reject(request.error);
            });
        const storeInDB = (
            db: IDBDatabase,
            key: string,
            value: any
        ): Promise<void> =>
            new Promise((resolve) => {
                db
                    .transaction("data", "readwrite")
                    .objectStore("data")
                    .put({ key, value }).onsuccess = () => resolve();
            });

        try {
            const db = await initDB();
            const [handle, data] = await Promise.all([
                getFromDB(db, "handle"),
                getFromDB(db, "data"),
            ]);
            if (handle && data) return data;
            if (!fromUser) return null;
            const fileHandle = (
                await window.showOpenFilePicker({
                    types: [
                        {
                            description: "TSV Files",
                            accept: { "text/tab-separated-values": [".tsv"] },
                        },
                    ],
                })
            )[0];
            const text = await (await fileHandle.getFile()).text();
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

            await Promise.all([
                storeInDB(db, "handle", fileHandle),
                storeInDB(db, "data", dataMap),
            ]);
            return dataMap;
        } catch (error) {
            console.error("Error in getData:", error);
            return null;
        }
    }

    async setData(newEntry: Entry): Promise<void> {}
}
