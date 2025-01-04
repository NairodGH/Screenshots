import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class Data {
    private db: IDBDatabase | null = null;

    getDB = (): Promise<IDBDatabase> =>
        new Promise((resolve, reject) => {
            const request = indexedDB.open("screenshots");
            request.onupgradeneeded = () => {
                console.log("Database created.");
                request.result.createObjectStore("handle");
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

    getHandle = (): Promise<FileSystemDirectoryHandle> =>
        new Promise((resolve, reject) => {
            const request = this.db!.transaction("handle", "readonly")
                .objectStore("handle")
                .get("handle");
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    console.log("Handle retrieved.");
                } else {
                    console.log("No handle found.");
                }
                resolve(result || null);
            };
            request.onerror = () => {
                console.error("Error retrieving handle:", request.error);
                reject(request.error);
            };
        });

    setHandle = (handle: FileSystemDirectoryHandle): Promise<void> =>
        new Promise((resolve, reject) => {
            const request = this.db!.transaction("handle", "readwrite")
                .objectStore("handle")
                .put(handle, "handle");
            request.onsuccess = () => {
                console.log("Handle stored.");
                resolve();
            };
            request.onerror = () => {
                console.error("Error storing handle.");
                reject(request.error);
            };
        });

    delete = (): Promise<void> =>
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

    async getScreenshots(): Promise<Map<string, string[]> | null> {
        let handle = null;
        // whether from onInit or getScreenshots, we'll need this.db for getHandle or setHandle
        if (!this.db) this.db = await this.getDB();
        const count = await new Promise<number>((resolve) => {
            const request = this.db!.transaction("handle", "readonly")
                .objectStore("handle")
                .count();
            request.onsuccess = () => resolve(request.result);
        });
        try {
            // if no data in database, try to open the directory picker for the user to select his screenshots folder
            if (!count) {
                handle = await window.showDirectoryPicker();
                await this.setHandle(handle);
            } else handle = await this.getHandle(); // else try to read an existing handle
        } catch (error) {
            // showDirectoryPicker will SecurityError when from onInit since not an user input, try to read an existing handle
            if (error instanceof DOMException && error.name === "SecurityError")
                handle = await this.getHandle();
        }
        // if we got the screenshots folder's handle, parse it into a Map<game name, screenshots names>
        if (handle) {
            const folderEntries: [string, string[]][] = [];
            for await (const folder of handle.values()) {
                if (folder.kind === "directory") {
                    const folderHandle = folder as FileSystemDirectoryHandle;
                    const pngFiles: string[] = [];
                    for await (const file of folderHandle.values()) {
                        if (
                            file.kind === "file" &&
                            file.name.endsWith(".png") &&
                            file.name !== `${folder.name}.png`
                        ) {
                            pngFiles.push(file.name.replace(".png", ""));
                        }
                    }
                    folderEntries.push([folder.name, pngFiles]);
                }
            }
            console.log(`Screenshots retrieved at ${handle.name}/.`);
            return new Map(folderEntries);
        }
        return null;
    }

    async addScreenshot(
        game: string,
        name: string,
        url: string
    ): Promise<void> {
        // download screenshot at (created if doesnt exists) *game name*/*screenshot name*.png
        const blob = await (await fetch(url)).blob();
        const gameHandle = await (
            await this.getHandle()
        ).getDirectoryHandle(game, {
            create: true,
        });
        const screenshotHandle = await gameHandle.getFileHandle(`${name}.png`, {
            create: true,
        });
        const writable = await screenshotHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log(`${game}/${name}.png downloaded.`);
    }
}
