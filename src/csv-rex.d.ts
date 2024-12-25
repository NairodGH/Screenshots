declare module "csv-rex" {
    export interface ParseOptions {
        delimiter?: string; // Specify the delimiter (e.g., ',' for CSV, '\t' for TSV)
        headers?: boolean; // Treat the first line as headers
        skipEmptyLines?: boolean; // Skip empty lines in the input
    }

    export function parse<T = any>(input: string, options?: ParseOptions): T[];
}
