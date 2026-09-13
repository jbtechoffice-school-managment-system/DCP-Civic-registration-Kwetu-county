import { useEffect, useState, useRef } from 'react';
import { supabaseApi } from '@/api/supabaseApi';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { FolderOpen, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth-role';
import { useToast } from '@/ui/use-toast';

const CATEGORIES = [
  { value: 'training', label: 'Training Material' },
  { value: 'brochure', label: 'Brochure' },
  { value: 'guide', label: 'Field Guide' },
  { value: 'policy', label: 'Policy Document' },
  { value: 'other', label: 'Other' },
];

export default function ContentLibrary() {
  const { user: me } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'training', file_url: '', file_type: '' });
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const all = await supabaseApi.entities.ContentLibraryItem.list('-created_date', 200);
      setItems(all);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = catFilter === 'all' ? items : items.filter((i) => i.category === catFilter);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await supabaseApi.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, file_url, file_type: file.type || 'file' }));
    } catch { toast({ title: 'Upload failed', variant: 'destructive' }); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const save = async () => {
    if (!form.title.trim()) return;
    try {
      await supabaseApi.entities.ContentLibraryItem.create({
        ...form,
        uploaded_by_name: me?.full_name || me?.email || 'Admin',
      });
      toast({ title: 'Document added' });
      setDialogOpen(false);
      setForm({ title: '', description: '', category: 'training', file_url: '', file_type: '' });
      load();
    } catch { toast({ title: 'Save failed', variant: 'destructive' }); }
  };

  const remove = async (id) => {
    await supabaseApi.entities.ContentLibraryItem.delete(id);
    load();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-slate-700" /> Content Library
          </h1>
          <p className="text-sm text-slate-500">Upload and manage training documents, brochures, and field guides.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Document</Button>
      </div>

      <Select value={catFilter} onValueChange={setCatFilter}>
        <SelectTrigger className="sm:w-56"><SelectValue placeholder="Filter by category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-sm text-slate-400">No documents found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 mt-1 inline-block">{CATEGORIES.find((c) => c.value === item.category)?.label || item.category}</span>
                    {item.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-3">
                      {item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer" className="text-xs text-sky-600 hover:underline">View</a>}
                      <button onClick={() => remove(item.id)} className="text-xs text-red-500 hover:underline ml-auto">Delete</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Document title" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>
            <div>
              <label className="text-xs text-slate-500">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-500">File</label>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Uploading…' : form.file_url ? 'File uploaded ✓' : 'Upload file'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.title.trim() || uploading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}