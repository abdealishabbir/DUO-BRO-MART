import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, requestPasswordReset, verifyEmail } from '../api/auth';

export default function AccountActionPage({ mode }: { mode: 'verify' | 'forgot' | 'reset' }): JSX.Element {
  const [params] = useSearchParams(); const [message, setMessage] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const uid = params.get('uid') || ''; const token = params.get('token') || '';
  useEffect(() => { if (mode === 'verify' && uid && token) verifyEmail(uid, token).then((data) => setMessage(data.detail)).catch((error) => setMessage(error.message)); }, [mode, token, uid]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); try { const data = mode === 'forgot' ? await requestPasswordReset(email) : await confirmPasswordReset(uid, token, password); setMessage(data.detail); } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to continue.'); } };
  const title = mode === 'verify' ? 'Verify email' : mode === 'forgot' ? 'Reset password' : 'Choose a new password';
  return <main className="min-h-screen bg-[#FBF7EF] flex items-center justify-center p-5"><section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-2xl font-bold text-[#101A2E]">{title}</h1>{mode === 'verify' ? <p className="mt-4 text-sm text-[#5B6B85]">{message || 'Verifying your email…'}</p> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-bold text-[#101A2E]">{mode === 'forgot' ? 'Email address' : 'New password'}<input required type={mode === 'forgot' ? 'email' : 'password'} minLength={8} value={mode === 'forgot' ? email : password} onChange={(e) => mode === 'forgot' ? setEmail(e.target.value) : setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-3" /></label><button className="w-full rounded-xl bg-[#101A2E] py-3 font-bold text-white">{mode === 'forgot' ? 'Send reset link' : 'Reset password'}</button>{message && <p className="text-sm text-[#5B6B85]">{message}</p>}</form>}<Link to="/login" className="mt-6 inline-block text-sm font-bold text-[#E0912A]">Back to login</Link></section></main>;
}
