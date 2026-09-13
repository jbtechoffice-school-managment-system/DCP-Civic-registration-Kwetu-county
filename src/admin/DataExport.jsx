import { useEffect, useState } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { logAudit } from '@/lib/audit';
import { useToast } from '@/ui/use-toast';

export default function DataExport() {
  const { user: me } = useCurrentUser();
  const { toast } = useToast();
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setRegs(await supabaseApi.entities.Registration.list('-created_date', 2000));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const exportCSV = async () => {
    if (me?.role !== 'admin') {
      toast({ title: 'Only admins can export data', variant: 'destructive' });
      return;
    }
    setExporting(true);
    try {
      const headers = ['id','first_name','surname','last_name','contact_number','date_of_birth','age_category','gender','county','constituency','ward','community','station','status','verification_status','consent_given','created_by','created_date','updated_date'];
      const rows = regs.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await logAudit('export_generated', '', `Full CSV export — ${regs.length} records`);
      toast({ title: 'Export ready', description: `${regs.length} records downloaded.` });
    } catch (e) {
      toast({ title: 'Export failed', description: e.message, variant: 'destructive' });
    } finally { setExporting(false); }
  };

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Export</h1>
        <p className="text-sm text-slate-500">Download the full registration database as a spreadsheet-compatible file.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" />CSV Export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{loading ? 'Counting records…' : `${regs.length} registration records available for export.`}</p>
          <Button onClick={exportCSV} disabled={exporting || loading || me?.role !== 'admin'}>
            <Download className="w-4 h-4 mr-2" />{exporting ? 'Exporting…' : 'Download CSV'}
          </Button>
          {me?.role !== 'admin' && <p className="text-xs text-amber-600">Admin access required to export data.</p>}
        </CardContent>
      </Card>

      <Card className="border-sky-200 bg-sky-50">
        <CardContent className="p-4 flex gap-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-sky-900">Google Sheets export</p>
            <p className="text-xs text-sky-700 mt-1">Direct Google Sheets sync requires connecting a Google Sheets account via OAuth. Once connected, exports can be pushed to a shared sheet automatically. Let me know when you'd like to set that up.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}