import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, Shield, ShoppingBag } from 'lucide-react';

export interface AdminLoginData { email: string; password: string }

interface AdminLoginPageProps { onAuthenticated?: (data: AdminLoginData) => void }

export default function AdminLoginPage({ onAuthenticated = (data) => console.log('admin login', data) }: AdminLoginPageProps): JSX.Element {
  const [credentials, setCredentials] = useState<AdminLoginData | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const submitCredentials = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); setCredentials({ email, password }); };
  const verifyPasskey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials || !passkey.trim()) return;
    setVerifying(true);
    window.setTimeout(() => onAuthenticated(credentials), 450);
  };

  return <div className="min-h-screen bg-[#101A2E] p-4 sm:p-7 flex items-center justify-center">
    <Link to="/login" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"><ArrowLeft size={16} /> Customer login</Link>
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div className="bg-gradient-to-br from-[#101A2E] to-[#1B2A47] px-7 py-8 text-center text-white">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#F2A93B] text-[#101A2E]"><ShoppingBag size={22} /></div>
        <h1 className="text-xl font-extrabold">DUOBRO MART Admin</h1>
        <p className="mt-1 text-sm text-white/70">Secure staff access portal</p>
      </div>
      <div className="p-7 sm:p-8">
        {!credentials ? <form onSubmit={submitCredentials} className="space-y-5">
          <div><h2 className="text-xl font-bold text-[#101A2E]">Admin login</h2><p className="mt-1 text-sm text-[#5B6B85]">Enter your staff credentials to continue.</p></div>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" /><p className="text-xs leading-relaxed text-amber-800"><strong>Restricted area.</strong> Access is only for authorised DUOBRO MART staff.</p></div>
          <Input label="Admin email" type="email" value={email} onChange={setEmail} placeholder="admin@duobromart.pk" icon={<Shield size={17} />} required />
          <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Admin password" icon={<Lock size={17} />} required toggle={() => setShowPassword((visible) => !visible)} visible={showPassword} />
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101A2E] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B2A47]"><Shield size={16} /> Continue to two-step verification</button>
        </form> : <form onSubmit={verifyPasskey} className="space-y-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700"><Shield size={21} /></div>
          <div><h2 className="text-xl font-bold text-[#101A2E]">Two-step verification</h2><p className="mt-1 text-sm text-[#5B6B85]">Enter the passkey for <strong>{credentials.email}</strong>.</p></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-relaxed text-amber-800">This is the passkey verification point. It currently accepts any non-empty passkey; connect it to the admin database when your backend is ready.</div>
          <Input label="Admin passkey" type={showPasskey ? 'text' : 'password'} value={passkey} onChange={setPasskey} placeholder="Enter your passkey" icon={<Lock size={17} />} required toggle={() => setShowPasskey((visible) => !visible)} visible={showPasskey} />
          <button disabled={verifying} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101A2E] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B2A47] disabled:opacity-60"><Shield size={16} />{verifying ? 'Verifying passkey...' : 'Verify and open dashboard'}</button>
          <button type="button" onClick={() => { setCredentials(null); setPasskey(''); }} disabled={verifying} className="w-full text-sm font-bold text-[#E0912A] hover:text-[#F2A93B]">Back to admin login</button>
        </form>}
      </div>
    </div>
  </div>;
}

function Input({ label, type, value, onChange, placeholder, icon, required, toggle, visible }: { label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string; icon: ReactNode; required?: boolean; toggle?: () => void; visible?: boolean }) {
  return <label className="block text-sm font-bold text-[#101A2E]">{label}<span className="relative mt-1.5 block"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B85]">{icon}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-11 text-sm outline-none transition-colors focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/25" />{toggle && <button type="button" onClick={toggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6B85]">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>}</span></label>;
}
