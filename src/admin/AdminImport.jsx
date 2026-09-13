import { useState, useRef } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { UploadCloud, FileSpreadsheet, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminImport() {
  const navigate = useNavigate();
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
      const { output } = await supabaseApi.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            records: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  first_name: { type: 'string' },
                  surname: { type: 'string' },
                  last_name: { type: 'string' },
                  id_number: { type: 'string' },
                  contact_number: { type: 'string' },
                  county: { type: 'string' },
                  constituency: { type: 'string' },
                  ward: { type: 'string' },
                  community: { type: 'string' },
                  gender: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const records = Array.isArray(output) ? output : output?.records || [];
      let success = 0, failed = 0;
      for (const r of records) {
        try {
          if (!r.first_name || !r.surname || !r.county) { failed++; continue; }
          await supabaseApi.entities.Registration.create({
            ...r,
            consent_given: true,
            status: 'pending',
            verification_status: 'unverified',
            sync_status: 'synced',
          });
          success++;
        } catch { failed++; }
      }
      setResults({ total: records.length, success, failed });
      toast({ title: `Import complete: ${success} success, ${failed} failed` });
    } catch (e) {
      toast({ title: 'Import failed', description: e.message, variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import Registrations</h1>
        <p className="text-sm text-slate-500">Upload Excel, CSV, or DOCX files to bulk import registration data.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-slate-400'}`}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.docx,.json" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        <UploadCloud className={`w-12 h-12 mx-auto mb-3 ${dragging ? 'text-sky-500' : 'text-slate-400'}`} />
        <p className="text-sm font-medium text-slate-700">{processing ? 'Processing…' : 'Drag & drop your file here'}</p>
        <p className="text-xs text-slate-500 mt-1">or click to browse — supports CSV, Excel, DOCX, JSON</p>
      </div>

      <div className="flex gap-3 justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500"><FileSpreadsheet className="w-4 h-4 text-green-600" /> .xlsx, .xls</div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><FileText className="w-4 h-4 text-blue-600" /> .csv, .docx</div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><FileText className="w-4 h-4 text-amber-600" /> .json</div>
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