import { Injectable } from "@angular/core";

export interface Info {
    name: string;
    src: string;
}

@Injectable({
    providedIn: "root",
})
export class Data {
    public db: IDBDatabase | null = null;

    getDB = (): Promise<IDBDatabase> =>
        new Promise((resolve, reject) => {
            const request = indexedDB.open("screenshots");
            request.onupgradeneeded = () => {
                console.log("Database created.");
                request.result.createObjectStore("data");
            };
            request.onsuccess = () => {
                console.log("Database opened.");
                resolve(request.result);
            };
            request.onerror = () => {
                console.error(`Error opening database: ${request.error}`);
                reject(request.error);
            };
        });

    getData = (key: string): Promise<any> =>
        new Promise((resolve, reject) => {
            try {
                const request = this.db!.transaction("data", "readonly")
                    .objectStore("data")
                    .get(key);
                request.onsuccess = () => {
                    const result = request.result;
                    if (result) {
                        console.log(`"${key}" retrieved.`);
                    } else {
                        console.log(`No "${key}" found.`);
                    }
                    resolve(result || null);
                };
                request.onerror = () => {
                    console.error(
                        `Error retrieving "${key}": ${request.error}`
                    );
                    reject(request.error);
                };
            } catch {
                resolve(null);
            }
        });

    setData = (key: string, value: any): Promise<void> =>
        new Promise((resolve, reject) => {
            const request = this.db!.transaction("data", "readwrite")
                .objectStore("data")
                .put(value, key);
            request.onsuccess = () => {
                console.log(`"${key}" stored.`);
                resolve();
            };
            request.onerror = () => {
                console.error(`Error storing "${key}": ${request.error}`);
                reject(request.error);
            };
        });

    delete = (): Promise<void> =>
        new Promise((resolve, reject) => {
            this.db!.close();
            this.db = null;
            const request = indexedDB.deleteDatabase("screenshots");
            request.onsuccess = () => {
                console.log("Database deleted successfully");
                resolve();
            };
            request.onerror = () => {
                console.error(`Error deleting database: ${request.error}`);
                reject(request.error);
            };
        });

    async getScreenshots(): Promise<Map<string, Info[]> | null> {
        let handle = null;
        // whether from onInit or getScreenshots, we'll need this.db for getHandle or setHandle
        if ((await indexedDB.databases()).length) this.db = await this.getDB();
        try {
            // if no data in database, try to open the directory picker for the user to select his screenshots folder
            if (!this.db) {
                handle = await window.showDirectoryPicker();
                this.db = await this.getDB();
                await this.setData("handle", handle);
            } else handle = await this.getData("handle"); // else try to read an existing handle
        } catch (error) {
            // showDirectoryPicker will SecurityError when from onInit since not an user input, try to read an existing handle
            if (error instanceof DOMException && error.name === "SecurityError")
                handle = await this.getData("handle");
        }
        // if we got the screenshots folder's handle, parse it into a Map<game name, screenshots names>
        if (handle) {
            const mergedScreenshots = new Map<string, Info[]>();
            for await (const folder of handle.values()) {
                if (folder.kind === "directory") {
                    const folderHandle = folder as FileSystemDirectoryHandle;
                    const infos: Info[] = [];

                    for await (const file of folderHandle.values()) {
                        if (
                            file.kind === "file" &&
                            file.name.endsWith(".png")
                        ) {
                            infos.push({
                                name: file.name.replace(".png", ""),
                                src: `${folder.name}/${file.name}`,
                            });
                        }
                    }
                    mergedScreenshots.set(folder.name, infos);
                }
            }
            console.log(`Screenshots retrieved at ${handle.name}/.`);
            const runtimeScreenshots = await this.getData("screenshots");
            if (runtimeScreenshots) {
                runtimeScreenshots.forEach((infos: Info[], game: string) => {
                    const mergedInfos = mergedScreenshots.get(game) || [];
                    infos.forEach((info) => {
                        const matchingInfo = mergedInfos.find(
                            (mergedInfo) => mergedInfo.name === info.name
                        );
                        if (matchingInfo) matchingInfo.src = info.src;
                    });
                    mergedScreenshots.set(
                        game,
                        mergedInfos.length ? mergedInfos : infos
                    );
                });
            }
            return mergedScreenshots;
        }
        return null;
    }

    async addScreenshot(
        game: string,
        name: string,
        src: string
    ): Promise<string | null> {
        // download screenshot at *game*/*name*.png with *src*'s data
        try {
            const blob = await (await fetch(src)).blob();
            const gameHandle = await (
                await this.getData("handle")
            ).getDirectoryHandle(game, {
                create: true,
            });
            const screenshotHandle = await gameHandle.getFileHandle(
                `${name}.png`,
                {
                    create: true,
                }
            );
            const writable = await screenshotHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log(`${game}/${name}.png downloaded.`);
            // since runtime-saved files aren't served, we need to persist their base64 data in indexedDB
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            const screenshots =
                (await this.getData("screenshots")) ||
                new Map<string, Info[]>();
            const gameScreenshots = screenshots.get(game) || [];
            gameScreenshots.push({ name, src: base64 });
            screenshots.set(game, gameScreenshots);
            await this.setData("screenshots", screenshots);
            return base64;
        } catch (error) {
            console.warn(`Couldn't download ${game}/${name}.png.`, error);
            return null;
        }
    }
}
