// frontend/src/utils/csvHelper.js

/**
 * Escapes a single CSV value.
 * Wraps in quotes if contains comma, quote, or newline.
 */
export const escapeCSVValue = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts an array of objects to a CSV string.
 */
export const arrayToCSV = (data, customHeaders = null) => {
  if (!data || !data.length) return '';

  const headers = customHeaders || Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');

  const rows = data.map((item) =>
    headers.map((h) => escapeCSVValue(item[h] ?? '')).join(',')
  );

  return [headerRow, ...rows].join('\r\n');
};

/**
 * Triggers an immediate browser file download of CSV content.
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Robust CSV parser that handles commas, quotes, and newlines inside quoted fields.
 */
export const parseCSV = (text) => {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      if (row.length > 1 || row[0].trim() !== '') {
        lines.push(row.map((cell) => cell.trim()));
      }
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row.map((cell) => cell.trim()));
  }

  if (lines.length < 2) return { headers: [], rows: [] };

  const rawHeaders = lines[0];
  // Normalize header names (lowercase, trim spaces, remove quotes)
  const headers = rawHeaders.map((h) =>
    h.trim().replace(/^["']|["']$/g, '')
  );

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (currentLine.length === 0 || (currentLine.length === 1 && !currentLine[0])) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = currentLine[idx] !== undefined ? currentLine[idx] : '';
    });
    rows.push(obj);
  }

  return { headers, rows };
};

/**
 * Sample CSV Templates for Admin Import
 */
export const PRODUCT_TEMPLATE_CSV = `name,category,seller,price,oldPrice,unit,moq,quantity,inStock,isActive,description,images
"Cotton Casual Shirt","Clothing","Apex Garments & Textiles Ltd.",499,999,"Piece","10 Pieces",150,"Yes","Active","Premium 100% breathable cotton shirts for bulk wholesale orders","https://images.unsplash.com/photo-1596755094514-f87e34085b2c"
"Stainless Steel Hex Bolts M8","Hardware & Tools","Apex Garments & Textiles Ltd.",12,18,"Piece","500 Pieces",5000,"Yes","Active","High tensile grade 8.8 stainless steel hex bolts for industrial use",""
"Designer Cotton Sarees Wholesale","Clothing","Apex Garments & Textiles Ltd.",850,1500,"Piece","25 Pieces",300,"Yes","Active","Handcrafted traditional printed cotton sarees direct from manufacturer",""`;

export const SELLER_TEMPLATE_CSV = `name,mainCategory,contactPerson,email,phone,city,state,address,businessType,yearEstablished,gstin,rating,isVerified,description
"Jaipur Textiles & Handlooms","Clothing","Rajesh Sharma","contact@jaipurtextiles.com","+91 98290 12345","Jaipur","Rajasthan","Plot 42, Sitapura Industrial Area","Manufacturer & Exporter",2012,"08AAACJ1234F1Z5",4.8,"Yes","Leading manufacturer and bulk supplier of cotton handloom fabrics, ethnic garments, and dyed textiles."
"Apex Industrial Tools & Fasteners","Hardware & Tools","Vikram Meena","info@apexsteel.in","+91 98291 54321","Jaipur","Rajasthan","RIICO Industrial Area, Mansarovar","Manufacturer & Wholesaler",2016,"08AABCA5678B1Z2",4.9,"Yes","Certified manufacturer of industrial fasteners, bolts, power tools, and precision sheet metal parts."
"National Electronics Hub","Electronics","Amit Verma","sales@nationalelec.com","+91 98292 98765","Delhi","Delhi","12, Electronics Complex, Okhla","Wholesaler & Distributor",2010,"07AABCN9988C1Z4",4.7,"Yes","Pan-India distributor of verified commercial audio accessories, connectors, and smart gadgets."`;

