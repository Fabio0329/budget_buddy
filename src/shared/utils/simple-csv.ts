type ParsedCsv = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let currentField = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.some((field) => field.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentField += char;
  }

  currentRow.push(currentField);
  if (currentRow.some((field) => field.trim().length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

export function parseCsvText(text: string): ParsedCsv {
  const rows = parseCsvRows(text.trim());
  const headers = rows[0]?.map((header) => header.trim()) ?? [];
  const dataRows = rows.slice(1).map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = row[index]?.trim() ?? "";
      return record;
    }, {}),
  );

  return {
    headers,
    rows: dataRows,
  };
}
