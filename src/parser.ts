import { Injectable } from "@angular/core";
import { parse } from "csv-rex";

@Injectable({
    providedIn: "root", // Makes the service available app-wide
})
export class Parser {
    async parseTSV<T>(filePath: string): Promise<T[]> {
        const response = await fetch(filePath);
        const text = await response.text();

        // Parse the TSV data
        return parse<T>(text, {
            delimiter: "\t", // Specify tab as the delimiter
            headers: true, // Treat the first line as headers
            skipEmptyLines: true,
        });
    }
}
