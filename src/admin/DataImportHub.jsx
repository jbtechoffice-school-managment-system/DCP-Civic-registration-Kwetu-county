import { useState, useRef } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/ui/use-toast';

export default function DataImportHub() {
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setProcessing(true);
    setResults(null);
    try {
      const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      const res = await supabaseApi.functions.invoke('bulkImportRegistrations', { file_url });
      const data = res.data || res;
      setResults({ total: data.total, success: data.success, failed: data.failed });
      toast({ title: `Import complete: ${data.success} success, ${data.failed} failed` });
    } catch (e) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Data Import Hub</h1>
        <p className="text-sm text-slate-500">Drag & drop Excel, CSV, or DOCX files to bulk import registrations.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !processing && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-colors ${dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.docx,.json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {processing ? (
          <Loader2 className="w-10 h-10 mx-auto mb-3 text-sky-500 animate-spin" />
        ) : (
          <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-sky-500' : 'text-slate-400'}`} />
        )}
        <p className="text-sm font-medium text-slate-700">{processing ? 'Processing…' : 'Drag & drop your file here'}</p>
        <p className="text-xs text-slate-500 mt-1">or click to browse</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><FileText className="w-4 h-4 text-blue-600" /> CSV</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><FileText className="w-4 h-4 text-amber-600" /> DOCX</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><FileText className="w-4 h-4 text-purple-600" /> JSON</div>
      </div>

      {results && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /><span className="text-sm">Successfully imported: <b>{results.success}</b></span></div>
            {results.failed > 0 && <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-600" /><span className="text-sm">Failed: <b>{results.failed}</b></span></div>}
            <p className="text-xs text-slate-500">Total records processed: {results.total}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}