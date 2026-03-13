import { z } from 'zod';
import { productSchema } from './validations';

export interface CSVParseResult<T> {
    data: T[];
    errors: { row: number; error: string }[];
}

export class CSVParser {
    /**
     * Parses a CSV string into an array of objects based on a Zod schema.
     * Assumes the first row is a header.
     */
    static parseProducts(csvText: string): CSVParseResult<z.infer<typeof productSchema>> {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            return { data: [], errors: [{ row: 0, error: 'CSV is empty or missing data' }] };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const result: CSVParseResult<z.infer<typeof productSchema>> = { data: [], errors: [] };

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = this.parseCSVLine(lines[i]);
                const rowObject: Record<string, string | number | boolean> = {};

                headers.forEach((header, index) => {
                    const value = values[index]?.trim() || '';

                    // Header mapping for flexibility
                    if (header === 'name' || header === 'title') rowObject.name = value;
                    if (header === 'description') rowObject.description = value;
                    if (header === 'price' || header === 'cost') rowObject.price = parseFloat(value) || 0;
                    if (header === 'stock' || header === 'quantity' || header === 'stock_quantity') rowObject.stock_quantity = parseInt(value, 10) || 0;
                    if (header === 'category') rowObject.category = value;
                    if (header === 'sku') rowObject.sku = value;
                    if (header === 'weight') rowObject.weight = parseFloat(value) || 0;
                });

                // Default values for fields not in CSV but required by schema
                rowObject.is_active = rowObject.is_active ?? true;
                rowObject.is_featured = rowObject.is_featured ?? false;

                // Validate with Zod
                const validated = productSchema.safeParse(rowObject);
                if (validated.success) {
                    result.data.push(validated.data);
                } else {
                    result.errors.push({
                        row: i + 1,
                        error: validated.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                    });
                }
            } catch (e) {
                result.errors.push({ row: i + 1, error: 'Malformed row structure' });
            }
        }

        return result;
    }

    /**
     * Basic CSV line parser handling quoted values with commas
     */
    private static parseCSVLine(line: string): string[] {
        const result = [];
        let curValue = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(curValue);
                curValue = '';
            } else {
                curValue += char;
            }
        }
        result.push(curValue);
        return result;
    }
}
