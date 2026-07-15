import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Store } from 'lucide-react';

export interface VendorLoginData { email: string; password: string }

export default function VendorLoginPage({ onAuthenticated }: { onAuthenticated: (data: VendorLoginData) => void }): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return <div className="min-h-screen bg-[#101A2E] p-4 sm:p-7 flex items-center justify-center">
    <Link to="/login" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"><ArrowLeft size={16} /> Customer login</Link>
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div className="bg-gradient-to-br from-[#101A2E] to-[#1B2A47] px-7 py-8 text-center text-white"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#F2A93B] text-[#101A2E]"><Store size={22} /></div><h1 className="text-xl font-extrabold">DUOBRO MART Vendor</h1><p className="mt-1 text-sm text-white/70">Approved seller access only</p></div>
      <form onSubmit={(event) => { event.preventDefault(); onAuthenticated({ email, password }); }} className="space-y-5 p-7 sm:p-8">
        <div><h2 className="text-xl font-bold text-[#101A2E]">Vendor login</h2><p className="mt-1 text-sm text-[#5B6B85]">Use the credentials issued after your application is approved.</p></div>
        <label className="block text-sm font-bold text-[#101A2E]">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="seller@business.pk" className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm outline-none focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/25" /></label>
        <label className="block text-sm font-bold text-[#101A2E]">Temporary password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required placeholder="Enter your password" className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm outline-none focus:border-[#F2A93B] focus:ring-2 focus:ring-[#F2A93B]/25" /></label>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#101A2E] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B2A47]"><Lock size={16} /> Sign in to vendor panel</button>
        <p className="text-center text-xs leading-relaxed text-[#5B6B85]">New to DUOBRO MART? <Link to="/vendor-register" className="font-bold text-[#E0912A] hover:text-[#F2A93B]">Apply to become a vendor</Link>.</p>
      </form>
    </div>
  </div>;
}
