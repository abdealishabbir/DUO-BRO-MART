import { useEffect, useState } from 'react';
import { refreshSession } from '../api/auth';

export default function SocialCallbackPage({ onComplete }: { onComplete: (user: { name: string; email: string; phone: string; role: 'customer' | 'vendor' | 'admin' }, access: string) => void }): JSX.Element {
  const [message, setMessage] = useState('Completing secure sign-in…');
  useEffect(() => { refreshSession().then((result) => onComplete(result.user, result.tokens.access)).catch(() => setMessage('Social sign-in could not be completed. Please try again.')); }, [onComplete]);
  return <main className="min-h-screen grid place-items-center bg-[#FBF7EF] p-5"><p className="rounded-2xl bg-white p-8 text-sm font-semibold text-[#101A2E] shadow">{message}</p></main>;
}
