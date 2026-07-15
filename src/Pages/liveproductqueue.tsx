import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
type QueueProduct = { id: number; name: string; status: string; price: string };

export default function LiveProductQueue(): JSX.Element {
  const [items, setItems] = useState<QueueProduct[]>([]); const [message, setMessage] = useState(''); const access = localStorage.getItem('duobro_access') || '';
  const load = () => fetch(`${API_URL}/admin/products/`, { headers: { Authorization: `Bearer ${access}` } }).then(async (response) => { if (!response.ok) throw new Error('Unable to load live product queue.'); const data = await response.json() as { results: QueueProduct[] }; setItems(data.results); }).catch((error: Error) => setMessage(error.message));
  useEffect(() => { load(); }, []);
  const approve = async (id: number) => { const response = await fetch(`${API_URL}/admin/products/${id}/approve/`, { method: 'POST', headers: { Authorization: `Bearer ${access}` } }); if (response.ok) load(); else setMessage('Approval failed.'); };
  return <section className="mb-6 rounded-2xl border border-[#ead8ca] bg-white p-5"><h2 className="font-bold">Live approval queue</h2><p className="mt-1 text-xs text-slate-500">Products submitted by vendors through the Django API.</p>{message && <p className="mt-3 text-sm text-red-600">{message}</p>}<div className="mt-4 space-y-2">{items.filter((item) => item.status === 'pending').map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3"><span className="text-sm font-semibold">{item.name} · PKR {item.price}</span><button onClick={() => approve(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Approve</button></div>)}{items.length === 0 && <p className="text-sm text-slate-500">No live submissions yet.</p>}</div></section>;
}
