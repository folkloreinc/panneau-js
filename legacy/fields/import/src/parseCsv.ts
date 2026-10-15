const DELIMITERS = [',', ';', '\t'];

function detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    let inQuotes = false;
    const counts: Record<string, number> = {};
    for (let i = 0; i < firstLine.length; i += 1) {
        const char = firstLine[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (!inQuotes && DELIMITERS.indexOf(char) !== -1) {
            counts[char] = (counts[char] || 0) + 1;
        }
    }
    return DELIMITERS.reduce(
        (best, delimiter) => ((counts[delimiter] || 0) > (counts[best] || 0) ? delimiter : best),
        DELIMITERS[0],
    );
}

/**
 * Parse a CSV text into rows of cells. Supports quoted cells (with escaped quotes and line
 * breaks), CRLF line endings, a BOM, and comma, semicolon or tab delimiters (auto-detected).
 * Empty lines are skipped.
 */
function parseCsv(input: string, delimiter: string | null = null): string[][] {
    const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
    const finalDelimiter = delimiter || detectDelimiter(text);
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    const pushRow = () => {
        row.push(cell);
        if (row.some((value) => value.trim() !== '')) {
            rows.push(row);
        }
        row = [];
        cell = '';
    };

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (inQuotes) {
            if (char === '"' && text[i + 1] === '"') {
                cell += '"';
                i += 1;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                cell += char;
            }
        } else if (char === '"') {
            inQuotes = true;
        } else if (char === finalDelimiter) {
            row.push(cell);
            cell = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && text[i + 1] === '\n') {
                i += 1;
            }
            pushRow();
        } else {
            cell += char;
        }
    }
    if (cell !== '' || row.length > 0) {
        pushRow();
    }
    return rows;
}

export default parseCsv;
