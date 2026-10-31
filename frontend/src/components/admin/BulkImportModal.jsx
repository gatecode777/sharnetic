// frontend/src/components/admin/BulkImportModal.jsx
import React, { useState } from 'react';
import { parseCSV, downloadCSV } from '../../utils/csvHelper';

const BulkImportModal = ({
  isOpen,
  onClose,
  title = 'Bulk Import',
  templateCsv = '',
  templateFilename = 'template.csv',
  onImport,
  onSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'paste'
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadCSV(templateCsv, templateFilename);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (selectedFile.name.endsWith('.json')) {
          const json = JSON.parse(text);
          const data = Array.isArray(json) ? json : json.items || [];
          if (!data.length) throw new Error('JSON file contains no array or items');
          setParsedRows(data);
          setHeaders(Object.keys(data[0] || {}));
        } else {
          const { headers: parsedHeaders, rows } = parseCSV(text);
          if (rows.length === 0) {
            throw new Error('No data rows found in CSV file.');
          }
          setHeaders(parsedHeaders);
          setParsedRows(rows);
        }
      } catch (err) {
        setError(err.message || 'Failed to parse file.');
        setParsedRows([]);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(selectedFile);
  };

  const handleParsePastedText = () => {
    if (!csvText.trim()) {
      setError('Please paste CSV content first.');
      return;
    }
    setError('');
    setResult(null);
    try {
      if (csvText.trim().startsWith('[') || csvText.trim().startsWith('{')) {
        const json = JSON.parse(csvText);
        const data = Array.isArray(json) ? json : json.items || [];
        setParsedRows(data);
        setHeaders(Object.keys(data[0] || {}));
      } else {
        const { headers: parsedHeaders, rows } = parseCSV(csvText);
        if (rows.length === 0) throw new Error('No valid rows found in CSV text.');
        setHeaders(parsedHeaders);
        setParsedRows(rows);
      }
    } catch (err) {
      setError(err.message || 'Invalid format.');
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) {
      setError('No parsed rows to import.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await onImport(parsedRows);

      if (res?.data?.success) {
        setResult(res.data);
        if (onSuccess) onSuccess();
      } else {
        setError(res?.data?.message || 'Bulk import failed on server.');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Server error during import.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setCsvText('');
    setParsedRows([]);
    setHeaders([]);
    setError('');
    setResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-file-import text-yellow-300 text-lg"></i>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 text-2xl font-bold leading-none focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-gray-700">
          
          {/* Step 1: Download Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-blue-900 text-sm flex items-center">
                <i className="fas fa-info-circle mr-2 text-blue-600"></i> Need standard file format?
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Download the sample CSV template with pre-formatted columns and sample rows.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-300 shadow-sm transition flex items-center space-x-1.5 flex-shrink-0"
            >
              <i className="fas fa-download"></i>
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Success Result Alert */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center text-green-800 font-bold mb-1">
                <i className="fas fa-check-circle mr-2 text-green-600 text-lg"></i>
                <span>Import Succeeded!</span>
              </div>
              <p className="text-xs text-green-700">
                {result.message || `${result.createdCount || 0} created, ${result.updatedCount || 0} updated.`}
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  <span className="font-bold">Notices ({result.errors.length}):</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>Row {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center">
              <i className="fas fa-exclamation-triangle mr-2 text-base text-red-500"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Tabs: Upload File vs Paste Text */}
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => { setActiveTab('file'); setError(''); }}
                className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                  activeTab === 'file'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-file-upload mr-1.5"></i> Upload CSV / JSON File
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('paste'); setError(''); }}
                className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                  activeTab === 'paste'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-paste mr-1.5"></i> Paste Raw Text
              </button>
            </div>

            {activeTab === 'file' ? (
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-6 text-center transition bg-gray-50/50">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p className="font-semibold text-gray-700 text-sm mb-1">
                  Choose a CSV or JSON file from your computer
                </p>
                <p className="text-xs text-gray-500 mb-4">Supports .csv or .json formatted datasets</p>
                <label className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow transition">
                  <i className="fas fa-folder-open mr-1.5"></i> Select File
                  <input
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {file && (
                  <div className="mt-3 text-xs font-semibold text-blue-700">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows="6"
                  placeholder="Paste comma-separated CSV text here..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-lg transition"
                >
                  <i className="fas fa-check mr-1.5"></i> Parse Pasted Content
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">
                  Parsed Preview: <span className="text-blue-600">{parsedRows.length} Rows Detected</span>
                </h4>
                <span className="text-xs text-gray-500">Showing first 5 rows</span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 font-bold text-gray-700 sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      {headers.map((h, idx) => (
                        <th key={idx} className="px-3 py-2 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-400">{i + 1}</td>
                        {headers.map((h, idx) => (
                          <td key={idx} className="px-3 py-2 truncate max-w-[160px]" title={row[h]}>
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {parsedRows.length > 0 && (
              <span className="text-xs font-semibold text-gray-600">
                Ready to import {parsedRows.length} records
              </span>
            )}
            <button
              type="button"
              disabled={loading || parsedRows.length === 0}
              onClick={handleExecuteImport}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center space-x-2 ${
                loading || parsedRows.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Start Import ({parsedRows.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkImportModal;

