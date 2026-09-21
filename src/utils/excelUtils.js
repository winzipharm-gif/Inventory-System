import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel file (.xlsx) from the inventory array.
 * @param {Array} inventory - The array of inventory objects.
 */
export const exportInventoryToExcel = (inventory) => {
    // Map internal keys to human-readable Excel column headers
    const exportData = inventory.map(item => ({
        'Brand / Product Name': item.name || '',
        'Generic Name': item.genericName || item.generic_name || '',
        'Category': item.category || '',
        'Dispensing Unit': item.unit || 'pcs',
        'Stock': item.stock || 0,
        'Min Stock Alert': item.minStock ?? item.min_stock ?? 10,
        'Price (₵)': item.price || 0,
        'Expiry Date': item.expiryDate || item.expiry_date || '',
        'Received Date': item.receivedDate || item.received_date || ''
    }));

    // Create a worksheet and a workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    // Generate buffer and trigger download
    XLSX.writeFile(workbook, 'Inventory_Export.xlsx');
};

/**
 * Parses an uploaded Excel file (.xlsx or .xls) and maps its rows to an array of product payload objects.
 * @param {File} file - The file uploaded via input.
 * @returns {Promise<Array>} A promise that resolves to an array of product objects ready for insertion.
 */
export const parseExcelImport = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Assuming the first sheet holds the data
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON with headers mapped exactly as they appear in the file
                const rawData = XLSX.utils.sheet_to_json(worksheet);

                // Map human-readable headers back to internal keys
                const mappedData = rawData.map(row => ({
                    name: String(row['Brand / Product Name'] || row['Name'] || '').trim(),
                    genericName: String(row['Generic Name'] || '').trim(),
                    category: String(row['Category'] || '').trim(),
                    unit: String(row['Dispensing Unit'] || row['Unit'] || 'pcs').trim(),
                    stock: Number(row['Stock'] || row['Current Stock'] || 0),
                    minStock: Number(row['Min Stock Alert'] || row['Min Stock'] || 10),
                    price: Number(row['Price (₵)'] || row['Price'] || 0),
                    // Excel dates might come in as strings or numbers; keep it simple assuming string format YYYY-MM-DD
                    expiryDate: row['Expiry Date'] ? String(row['Expiry Date']) : '',
                    receivedDate: row['Received Date'] ? String(row['Received Date']) : new Date().toISOString().split('T')[0]
                })).filter(item => item.name); // Filter out entirely empty rows missing a name

                resolve(mappedData);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
