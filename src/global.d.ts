interface Window {
    showDirectoryPicker(options?: {
        mode?: "read" | "readwrite";
    }): Promise<FileSystemDirectoryHandle>;
}

declare module "csv-rex" {
    export function parse<T = any>(
        input: string,
        options?: {
            delimiter?: string;
        }
    ): T[];
}
