import { useState } from 'react';
import analyticsService from '../../services/analyticsService';

const ExportButton = ({ type, label, filters = {} }) => {
  const [exporting, setExporting] = useState(false);

  const buildCSV = (rows) => {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    rows.forEach((row) => {
      const values = headers.map((h) => {
        const val = String(row[h] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      });
      lines.push(values.join(','));
    });
    return lines.join('\n');
  };

  const buildExcel = (rows) => {
    if (!rows || rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join('\t')];
    rows.forEach((row) => {
      const values = headers.map((h) => {
        const val = String(row[h] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      });
      lines.push(values.join('\t'));
    });
    return lines.join('\n');
  };

  const download = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await analyticsService.getExportData(type, filters);
      const rows = res.data?.data || [];

      if (rows.length === 0) {
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = `drmp-${type}-${timestamp}`;

      if (format === 'csv') {
        download(buildCSV(rows), `${baseName}.csv`, 'text/csv;charset=utf-8;');
      } else {
        download(
          buildExcel(rows),
          `${baseName}.xls`,
          'application/vnd.ms-excel;charset=utf-8;'
        );
      }
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative group inline-block">
      <button
        disabled={exporting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {exporting ? (
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent" />
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {label || 'Export'}
      </button>
      <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
        <button
          onClick={() => handleExport('csv')}
          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-t-lg"
        >
          Export CSV
        </button>
        <button
          onClick={() => handleExport('excel')}
          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-b-lg"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default ExportButton;
