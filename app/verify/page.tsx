'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ColumnInfo {
  index: number;
  letter: string;
  header: string;
  sampleData: string;
}

export default function VerifyPage() {
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyColumns = async () => {
    setLoading(true);
    setError('');
    try {
      const savedSetup = localStorage.getItem('dialerSetup');
      if (!savedSetup) {
        setError('No spreadsheet configured. Please set up from the dashboard first.');
        return;
      }

      const { spreadsheetId } = JSON.parse(savedSetup);
      const response = await fetch(
        `/api/verify-columns?spreadsheetId=${encodeURIComponent(spreadsheetId)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setColumns(data.columns || []);
      console.log('[v0] Column verification:', data);
    } catch (err: any) {
      console.error('[v0] Verification error:', err);
      setError(err.message || 'Failed to verify columns');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Google Sheet Column Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              This tool shows you exactly which columns are in your Google Sheet and what data
              they contain. Use this to verify the app is reading from the correct columns.
            </p>
            <Button
              onClick={verifyColumns}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Verifying...' : 'Verify Columns'}
            </Button>
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {columns.length > 0 && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-xl text-white">Column Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-slate-400">Letter</th>
                      <th className="text-left py-2 px-3 text-slate-400">Index</th>
                      <th className="text-left py-2 px-3 text-slate-400">Header</th>
                      <th className="text-left py-2 px-3 text-slate-400">Sample Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((col) => (
                      <tr
                        key={col.index}
                        className="border-b border-slate-800 hover:bg-slate-700/30"
                      >
                        <td className="py-2 px-3 font-mono text-blue-400">{col.letter}</td>
                        <td className="py-2 px-3 text-slate-400">{col.index}</td>
                        <td className="py-2 px-3 text-white font-medium">{col.header}</td>
                        <td className="py-2 px-3 text-slate-300 truncate max-w-md">
                          {col.sampleData}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
