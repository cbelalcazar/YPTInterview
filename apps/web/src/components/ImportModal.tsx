'use client';

import React, { useState } from 'react';
import { API_URL } from '../lib/constants';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; summary: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/estimates/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResult(data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Import KPI Dataset</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-lg text-sm max-h-60 overflow-y-auto">
            <p className="font-bold text-green-800 mb-2">Successfully imported {result.imported} records!</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-green-700 text-xs uppercase tracking-wider mb-1">Companies Detected ({result.summary?.companies?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {result.summary?.companies?.map((c: string) => (
                    <span key={c} className="bg-white/60 text-green-800 px-2 py-0.5 rounded text-xs border border-green-200">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-700 text-xs uppercase tracking-wider mb-1">Retailers Found ({result.summary?.retailers?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {result.summary?.retailers?.map((r: string) => (
                    <span key={r} className="bg-white/60 text-green-800 px-2 py-0.5 rounded text-xs border border-green-200">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-700 text-xs uppercase tracking-wider mb-1">KPIs Processed ({result.summary?.kpis?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {result.summary?.kpis?.map((k: string) => (
                    <span key={k} className="bg-white/60 text-green-800 px-2 py-0.5 rounded text-xs border border-green-200">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
