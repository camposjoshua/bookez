import * as XLSX from 'xlsx';

export function downloadExcel<T extends object>(
  data: T[],
  filename = 'data.xlsx',
) {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // 1. Convert JSON array to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 3. Append worksheet
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 4. Trigger file download
  XLSX.writeFile(workbook, filename);
}
