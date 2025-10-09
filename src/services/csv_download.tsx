// utils/csvDownload.ts
export function downloadCSV<T extends object>(
  data: T[],
  filename = 'data.csv',
) {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Build CSV rows
  const csvRows = [
    headers.join(','), // header row
    ...data.map((row) =>
      headers
        .map((field) => JSON.stringify((row as any)[field] ?? ''))
        .join(','),
    ),
  ];

  const csvString = csvRows.join('\n');

  // Create a Blob and download
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
}
