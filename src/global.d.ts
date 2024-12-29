interface Window {
    showOpenFilePicker(options?: FilePickerOptions): Promise;
}

declare module "csv-rex" {
    export function parse<T = any>(
        input: string,
        options?: {
            delimiter?: string;
            headers?: boolean;
            skipEmptyLines?: boolean;
        }
    ): T[];
}
