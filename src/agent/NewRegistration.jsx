import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseApi } from '@/api/supabaseApi';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/ui/select';
import { Checkbox } from '@/ui/checkbox';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { COUNTIES, constituenciesFor, wardsFor, communitiesFor } from '@/lib/geo';
import { addToQueue, isOnline } from '@/lib/offline';
import { useToast } from '@/ui/use-toast';
import { useCurrentUser } from '@/lib/auth-role';

const empty = {
  first_name: '', surname: '', last_name: '', id_number: '', contact_number: '',
  agent_reference: '', date_of_birth: '', age_category: '', gender: '', religion: '',
  county: '', constituency: '', ward: '', community: '', station: '',
  consent_given: false, notes: '',
};

export default function NewRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: me } = useCurrentUser();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [otherCommunity, setOtherCommunity] = useState('');
  const idempotencyRef = useRef('idem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9));

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Please enter the resident\'s first name.';
    if (!form.surname.trim()) e.surname = 'Please enter the resident\'s surname.';
    if (!form.id_number.trim()) e.id_number = 'Please enter the resident\'s ID number.';
    if (form.contact_number && !/^[0-9+\-\s]{7,15}$/.test(form.contact_number.trim())) e.contact_number = 'Enter a valid contact number.';
    if (!form.county) e.county = 'Please select a county.';
    if (!form.constituency) e.constituency = 'Please select a constituency.';
    if (!form.ward) e.ward = 'Please select a ward.';
    if (!form.community.trim()) e.community = 'Please enter the community/village.';
    if (!form.consent_given) e.consent = 'Consent is required to save this registration.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const checkDuplicate = async () => {
    try {
      const existing = await supabaseApi.entities.Registration.filter({
        first_name: form.first_name.trim(), surname: form.surname.trim(), ward: form.ward,
      }, '-created_date', 5);
      return existing.length > 0 ? existing[0] : null;
    } catch { return null; }
  };

  const submit = async () => {
    setDuplicate(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const dup = await checkDuplicate();
      if (dup && !duplicate) { setDuplicate(dup); setSubmitting(false); return; }
      const resolvedCommunity = form.community === '__others__' ? otherCommunity.trim() : form.community;
      const payload = {
        ...form, community: resolvedCommunity,
        agent_reference: me?.agent_reference || '',
        age_category: form.age_category || '', gender: form.gender || '', religion: form.religion || '',
        idempotency_key: idempotencyRef.current,
      };
      if (isOnline()) {
        const res = await supabaseApi.functions.invoke('createRegistration', payload);
        const result = res.data || res;
        if (result.fieldErrors) { setErrors(result.fieldErrors); setSubmitting(false); return; }
      } else {
        addToQueue({ ...payload, sync_status: 'pending_sync' });
      }
      setSuccess({ name: `${form.first_name} ${form.surname}` });
    } catch {
      toast({ title: 'Unable to save this registration. Please check the information and try again.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setForm(empty); setOtherCommunity(''); setErrors({}); setDuplicate(null); setSuccess(null);
    idempotencyRef.current = 'idem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  };

  if (success) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center select-none">
        <div className="w-16 h-16 rounded-full bg-[#D9FDD3] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#008F4C]" />
        </div>
        <h2 className="text-xl font-semibold text-[#111B21] mb-1">Resident registered successfully</h2>
        <p className="text-sm text-[#667781] mb-6">{success.name} has been registered.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate('/app/registrations')} className="w-full h-12 rounded-xl bg-[#008F4C] text-white font-medium active:opacity-80">
            View Residents
          </button>
          <button onClick={resetForm} className="w-full h-12 rounded-xl bg-[#F0F2F5] text-[#111B21] font-medium active:opacity-80">
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 select-none">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E9EDEF] px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate('/app')} className="p-1.5 -ml-1.5 hover:bg-[#F0F2F5] rounded-full">
          <ArrowLeft className="w-5 h-5 text-[#111B21]" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#111B21]">Register Resident</h1>
          <p className="text-xs text-[#667781]">Enter the resident's details</p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Personal Information */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#111B21]">Personal Information</p>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">First Name <span className="text-[#EA4335]">*</span></Label>
            <Input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="Enter first name" className={`h-12 ${errors.first_name ? 'border-[#EA4335]' : ''}`} />
            {errors.first_name && <p className="text-xs text-[#EA4335] mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Surname <span className="text-[#EA4335]">*</span></Label>
            <Input value={form.surname} onChange={(e) => set('surname', e.target.value)} placeholder="Enter surname" className={`h-12 ${errors.surname ? 'border-[#EA4335]' : ''}`} />
            {errors.surname && <p className="text-xs text-[#EA4335] mt-1">{errors.surname}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Last Name</Label>
            <Input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Enter last name (optional)" className="h-12" />
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">ID Number <span className="text-[#EA4335]">*</span></Label>
            <Input value={form.id_number} onChange={(e) => set('id_number', e.target.value)} placeholder="National ID number" className={`h-12 ${errors.id_number ? 'border-[#EA4335]' : ''}`} />
            {errors.id_number && <p className="text-xs text-[#EA4335] mt-1">{errors.id_number}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Contact</Label>
            <Input value={form.contact_number} onChange={(e) => set('contact_number', e.target.value)} placeholder="Phone number" className={`h-12 ${errors.contact_number ? 'border-[#EA4335]' : ''}`} />
            {errors.contact_number && <p className="text-xs text-[#EA4335] mt-1">{errors.contact_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[#667781] mb-1.5 block">Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className="h-12" />
            </div>
            <div>
              <Label className="text-xs text-[#667781] mb-1.5 block">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Religion</Label>
            <Select value={form.religion} onValueChange={(v) => set('religion', v)}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select religion" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="christianity">Christianity</SelectItem>
                <SelectItem value="islam">Islam</SelectItem>
                <SelectItem value="hinduism">Hinduism</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 pt-2 border-t border-[#E9EDEF]">
          <p className="text-sm font-medium text-[#111B21] pt-2">Location</p>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">County <span className="text-[#EA4335]">*</span></Label>
            <Select value={form.county} onValueChange={(v) => { set('county', v); set('constituency', ''); set('ward', ''); }}>
              <SelectTrigger className={`h-12 ${errors.county ? 'border-[#EA4335]' : ''}`}><SelectValue placeholder="Select county" /></SelectTrigger>
              <SelectContent>{COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.county && <p className="text-xs text-[#EA4335] mt-1">{errors.county}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Constituency <span className="text-[#EA4335]">*</span></Label>
            <Select value={form.constituency} onValueChange={(v) => { set('constituency', v); set('ward', ''); }} disabled={!form.county}>
              <SelectTrigger className={`h-12 ${errors.constituency ? 'border-[#EA4335]' : ''}`}><SelectValue placeholder="Select constituency" /></SelectTrigger>
              <SelectContent>{constituenciesFor(form.county).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.constituency && <p className="text-xs text-[#EA4335] mt-1">{errors.constituency}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Ward <span className="text-[#EA4335]">*</span></Label>
            <Select value={form.ward} onValueChange={(v) => set('ward', v)} disabled={!form.constituency}>
              <SelectTrigger className={`h-12 ${errors.ward ? 'border-[#EA4335]' : ''}`}><SelectValue placeholder="Select ward" /></SelectTrigger>
              <SelectContent>{wardsFor(form.county, form.constituency).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
            {errors.ward && <p className="text-xs text-[#EA4335] mt-1">{errors.ward}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Community / Village <span className="text-[#EA4335]">*</span></Label>
            {communitiesFor(form.county, form.constituency, form.ward).length > 0 ? (
              <>
                <Select value={form.community} onValueChange={(v) => { set('community', v); if (v !== '__others__') setOtherCommunity(''); }}>
                  <SelectTrigger className={`h-12 ${errors.community ? 'border-[#EA4335]' : ''}`}><SelectValue placeholder="Select community" /></SelectTrigger>
                  <SelectContent>
                    {communitiesFor(form.county, form.constituency, form.ward).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="__others__">Others (type below)</SelectItem>
                  </SelectContent>
                </Select>
                {form.community === '__others__' && (
                  <Input value={otherCommunity} onChange={(e) => setOtherCommunity(e.target.value)} placeholder="Type community / village name" className="h-12 mt-2" />
                )}
              </>
            ) : (
              <Input value={form.community} onChange={(e) => set('community', e.target.value)} placeholder="Type community / village" className={`h-12 ${errors.community ? 'border-[#EA4335]' : ''}`} />
            )}
            {errors.community && <p className="text-xs text-[#EA4335] mt-1">{errors.community}</p>}
          </div>

          <div>
            <Label className="text-xs text-[#667781] mb-1.5 block">Polling Station</Label>
            <Input value={form.station} onChange={(e) => set('station', e.target.value)} placeholder="Enter polling station" className="h-12" />
          </div>
        </div>

        {/* Consent */}
        <div className="pt-2 border-t border-[#E9EDEF]">
          <div className="flex items-start gap-2 pt-2">
            <Checkbox id="consent" checked={form.consent_given} onCheckedChange={(v) => set('consent_given', !!v)} className="mt-1" />
            <Label htmlFor="consent" className="text-xs text-[#667781] leading-relaxed">
              I confirm that the individual has been informed of the purpose of this community registration and has freely given consent for their data to be collected.
            </Label>
          </div>
          {errors.consent && <p className="text-xs text-[#EA4335] mt-1">{errors.consent}</p>}
        </div>

        {/* Duplicate warning */}
        {duplicate && (
          <div className="bg-[#FFF8E1] border border-[#F7C948] rounded-xl p-3 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F7C948] shrink-0" />
            <div className="text-xs text-[#111B21]">
              <p className="font-medium mb-1">Possible duplicate registration detected.</p>
              <p>A record for <b>{duplicate.first_name} {duplicate.surname}</b> in <b>{duplicate.ward}</b> already exists. Submitting will flag this for administrator review.</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button onClick={submit} disabled={submitting} className="w-full h-14 rounded-xl bg-[#008F4C] text-white font-semibold text-base active:opacity-80 disabled:opacity-50">
          {submitting ? 'Registering...' : duplicate ? 'Confirm & Register' : 'REGISTER RESIDENT'}
        </button>

        {/* Developer info */}
        <div className="text-center pt-2 pb-4 border-t border-[#E9EDEF]">
          <p className="text-[10px] text-[#667781]">Developed by DiploTech Africa · TechGov Africa</p>
          <a href="mailto:jbtechadvanced@gmail.com" className="text-[10px] text-[#008F4C] hover:underline">jbtechadvanced@gmail.com</a>
        </div>
      </div>
    </div>
  );
}