/**
 * Utility to export JSON data to CSV (Excel compatible)
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Desired name for the file
 */
export const exportToCSV = (data, fileName) => {
    if (!data || !data.length) {
        alert("No data to export");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add headers row

    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Escape commas and wrap in quotes for CSV safety
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
