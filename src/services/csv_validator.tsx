// utils/csvValidator.ts
import { parse } from "csv-parse/sync";

type ValidationError = {
  row: number;
  column?: string;
  message: string;
};

type CsvValidationOptions = {
  requiredHeaders: string[];
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
};

export default function validateCsv(
  csvBuffer: Buffer,
  options: CsvValidationOptions,
  meta?: { mimeType?: string; fileName?: string } // pass extra info if available
): {
  valid: boolean;
  errors: ValidationError[];
  rows?: Record<string, string>[];
} {
  const errors: ValidationError[] = [];

  // 1. File format check
  if (options.allowedMimeTypes && meta?.mimeType) {
    if (!options.allowedMimeTypes.includes(meta.mimeType)) {
      errors.push({
        row: 0,
        message: `Invalid file type: ${meta.mimeType}. Only CSV files are allowed.`,
      });
      return { valid: false, errors };
    }
  }

  if (options.allowedExtensions && meta?.fileName) {
    const ext = meta.fileName.split(".").pop()?.toLowerCase();
    if (!ext || !options.allowedExtensions.includes(ext)) {
      errors.push({
        row: 0,
        message: `Invalid file extension ".${ext}". Only .csv is allowed.`,
      });
      return { valid: false, errors };
    }
  }

  // 2. File size check
  if (options.maxFileSize && csvBuffer.byteLength > options.maxFileSize) {
    errors.push({
      row: 0,
      message: `File size exceeds limit of ${options.maxFileSize / 1024} KB`,
    });
    return { valid: false, errors };
  }

  // 3. Parse CSV safely
  let records: Record<string, string>[];
  let headers: string[];
  try {
    records = parse(csvBuffer.toString("utf-8"), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    headers = Object.keys(records[0] || {});
  } catch (err) {
    errors.push({ row: 0, message: "Invalid CSV format" });
    return { valid: false, errors };
  }

  // 4. Header validation
  for (const required of options.requiredHeaders) {
    if (!headers.includes(required)) {
      errors.push({
        row: 0,
        column: required,
        message: `Missing required header: ${required}`,
      });
    }
  }

  // 5. Row-level validation
  records.forEach((row, index) => {
    options.requiredHeaders.forEach((header) => {
      if (!row[header] || row[header].trim() === "") {
        errors.push({
          row: index + 2,
          column: header,
          message: `Missing value for "${header}"`,
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    rows: errors.length === 0 ? records : undefined,
  };
}
