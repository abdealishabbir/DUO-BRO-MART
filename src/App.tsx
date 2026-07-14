import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import AuthPage from './Pages/login';
import AdminPanel from './Pages/admin';
import AdminLoginPage from './Pages/adminlogin';
import {
  ShoppingBag, Menu, X, Minus, Plus, Trash2, ArrowLeft, MessageCircle,
  ArrowRight, ShieldCheck, Truck, Phone, Mail, ChevronDown,
  CheckCircle, AlertCircle, AlertTriangle, Star, UserCircle, LogOut,
} from 'lucide-react';
/* ─── Scroll To Top on Route Change ─── */
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

/* ─── Cart Context ─── */
interface CartItem { id: number; name: string; price: number; image: string; qty: number; discount: number }
interface CartCtx {
  cart: CartItem[]; addToCart: (i: Omit<CartItem, 'qty'>) => void;
  changeQty: (id: number, d: number) => void; removeItem: (id: number) => void;
  clearCart: () => void; cartCount: number; cartTotal: number;
  cartOpen: boolean; setCartOpen: (o: boolean) => void;
}
const Ctx = createContext<CartCtx | null>(null);
function useCart() { const c = useContext(Ctx); if (!c) throw new Error('no cart'); return c; }

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('duobro_cart') || '[]'); } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => { localStorage.setItem('duobro_cart', JSON.stringify(cart)); }, [cart]);
  const addToCart = (item: Omit<CartItem, 'qty'>) => setCart((p) => { const e = p.find((i) => i.id === item.id); return e ? p.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...item, qty: 1 }]; });
  const changeQty = (id: number, d: number) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: i.qty + d } : i).filter((i) => i.qty > 0));
  const removeItem = (id: number) => setCart((p) => p.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + Math.round(i.price * (1 - (i.discount || 0) / 100)) * i.qty, 0);
  return <Ctx.Provider value={{ cart, addToCart, changeQty, removeItem, clearCart, cartCount, cartTotal, cartOpen, setCartOpen }}>{children}</Ctx.Provider>;
}

/* ─── Header ─── */
function Header() {
  const { cartCount, setCartOpen } = useCart();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const links = [
    { to: '/home', label: 'Home' }, { to: '/shop', label: 'Shop' },
    { to: '/terms-buyers', label: 'Terms & Conditions' }, { to: '/vendor-register', label: 'Become a Vendor' },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-[rgba(250,248,244,0.92)] backdrop-blur-[16px] border-b border-[var(--border)] px-5 h-16 flex items-center justify-between">
      <Link to="/home" className="flex flex-col leading-none">
        <span className="font-['Playfair_Display'] text-xl font-bold tracking-[2px] text-[var(--charcoal)]">DUOBRO MART</span>
        <span className="text-[9px] font-medium tracking-[1.5px] text-[var(--muted)] uppercase mt-0.5">Shop Easy. Live Better</span>
      </Link>
      <nav className="hidden md:flex gap-7 items-center">
        {links.map((l) => <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors duration-200 ${loc.pathname === l.to ? 'text-[var(--accent)]' : 'text-[var(--charcoal)] hover:text-[var(--accent)]'}`}>{l.label}</Link>)}
        {user ? <Link to="/profile" className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${loc.pathname === '/profile' ? 'text-[var(--accent)]' : 'text-[var(--charcoal)] hover:text-[var(--accent)]'}`}><UserCircle size={19} /> Profile</Link> : <Link to="/login" className={`text-sm font-medium transition-colors duration-200 ${loc.pathname === '/login' ? 'text-[var(--accent)]' : 'text-[var(--charcoal)] hover:text-[var(--accent)]'}`}>Login</Link>}
      </nav>
      <div className="flex items-center gap-3">
        <button onClick={() => setCartOpen(true)} className="bg-[var(--charcoal)] text-white border-none rounded-full px-4 py-2 text-[13px] font-semibold flex items-center gap-2 transition-colors duration-200 hover:bg-[var(--warm-brown)]">
          <ShoppingBag size={16} /> Cart
          {cartCount > 0 && <span className="bg-[var(--accent)] text-white rounded-full w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
        </button>
        <button onClick={() => setOpen(!open)} className="md:hidden bg-transparent border-none cursor-pointer text-[var(--charcoal)]">{open ? <X size={24} /> : <Menu size={24} />}</button>
      </div>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[var(--border)] shadow-lg md:hidden">
          <nav className="flex flex-col p-4 gap-4">{links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors ${loc.pathname === l.to ? 'bg-[var(--cream)] text-[var(--accent)]' : 'text-[var(--charcoal)] hover:bg-[var(--cream)]'}`}>{l.label}</Link>)}{user ? <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium py-2 px-4 rounded-lg text-[var(--charcoal)] hover:bg-[var(--cream)]"><UserCircle size={16} className="inline mr-2" />Profile</Link> : <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium py-2 px-4 rounded-lg text-[var(--charcoal)] hover:bg-[var(--cream)]">Login</Link>}</nav>
        </div>
      )}
    </header>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[var(--charcoal)] text-[rgba(255,255,255,0.6)] text-center py-8 px-5 text-[13px] leading-8">
      <strong className="text-white text-[15px] font-['Playfair_Display']">DUOBRO MART</strong><br />Shop Easy. Live Better.<br /><br />
      <div className="flex justify-center gap-6 flex-wrap mt-4">
        <a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="text-[rgba(255,255,255,0.6)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"><Phone size={14} /> +92 331 3146400</a>
        <a href="mailto:duobroelite@gmail.com" className="text-[rgba(255,255,255,0.6)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"><Mail size={14} /> duobroelite@gmail.com</a>
      </div>
      <div className="mt-6 flex justify-center gap-4 flex-wrap">
        <Link to="/terms-buyers" className="text-[rgba(255,255,255,0.6)] hover:text-[var(--accent)] transition-colors">Terms & Conditions</Link>
        <span className="text-[rgba(255,255,255,0.3)]">|</span>
        <Link to="/vendor-register" className="text-[rgba(255,255,255,0.6)] hover:text-[var(--accent)] transition-colors">Vendor Registration</Link>
      </div>
      <small className="block mt-4">&copy; 2026 DUOBRO MART. All rights reserved.</small>
    </footer>
  );
}

/* ─── Cart Modal ─── */
function CartModal() {
  const { cart, changeQty, removeItem, clearCart, cartTotal, cartOpen, setCartOpen } = useCart();
  const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!cartOpen) return null;
  const close = () => { setCartOpen(false); setView('cart'); };
  const continueShopping = () => { setCartOpen(false); setView('cart'); navigate('/shop'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.target as HTMLFormElement);
    let summary = 'DUOBRO MART ORDER\n\nITEMS:\n';
    cart.forEach((item, i) => { const discounted = Math.round(item.price * (1 - (item.discount || 0) / 100)); summary += `${i + 1}. ${item.name} - Qty:${item.qty} x Rs ${item.price.toLocaleString()}${item.discount ? ` (${item.discount}% OFF → Rs ${discounted.toLocaleString()})` : ''} = Rs ${(discounted * item.qty).toLocaleString()}\n`; });
    summary += `\nGRAND TOTAL: Rs ${cartTotal.toLocaleString()}`;
    const sd = new FormData();
    sd.append('_subject', `New Order - Rs ${cartTotal.toLocaleString()}`);
    sd.append('Order Summary', summary);
    sd.append('Grand Total', `Rs ${cartTotal.toLocaleString()}`);
    sd.append('Customer Name', fd.get('name') as string);
    sd.append('Phone', fd.get('phone') as string);
    sd.append('Address', fd.get('address') as string);
    const totalOriginal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const totalSavings = totalOriginal - cartTotal;
    if (totalSavings > 0) sd.append('Total Discount Savings', `Rs ${totalSavings.toLocaleString()} saved`);
    sd.append('Instructions', (fd.get('instructions') as string) || 'None');
    try {
      const res = await fetch('https://formspree.io/f/mlgpblno', { method: 'POST', body: sd, headers: { Accept: 'application/json' } });
      if (res.ok) { clearCart(); setView('success'); (e.target as HTMLFormElement).reset(); }
      else alert('Could not place order. Please try again.');
    } catch { alert('Network error. Please check your connection.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(28,28,30,0.55)] z-[200] flex items-end justify-center sm:items-center" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="bg-[var(--cream)] rounded-t-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col sm:rounded-2xl sm:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-[var(--border)] bg-white">
          <h2 className="font-['Playfair_Display'] text-[22px] font-bold">{view === 'cart' ? 'Your Cart' : view === 'checkout' ? 'Place Your Order' : 'Order Confirmed!'}</h2>
          <button onClick={close} className="bg-[var(--border)] border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#D8D0C8]"><X size={18} /></button>
        </div>

        {view === 'cart' && (<>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted)]"><ShoppingBag size={48} className="mx-auto mb-3 opacity-40" /><p>Your cart is empty.<br />Start shopping!</p></div>
            ) : cart.map((item) => (
              <div key={item.id} className="flex gap-3.5 items-center py-3.5 border-b border-[var(--border)]">
                <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded-[10px] flex-shrink-0 bg-[#F0EBE5]" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{item.name}</div>
                  <div className="text-[13px] text-[var(--accent-dark)] font-semibold mt-0.5">Rs {item.price.toLocaleString()}{item.discount ? <span className="ml-1 text-[11px] text-[#EF4444] font-bold">{item.discount}% OFF</span> : null}</div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5">Subtotal: Rs {(Math.round(item.price * (1 - (item.discount || 0) / 100)) * item.qty).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => changeQty(item.id, -1)} className="bg-[var(--border)] border-none w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#C8C0B8]"><Minus size={14} /></button>
                  <span className="text-[15px] font-bold min-w-5 text-center">{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} className="bg-[var(--border)] border-none w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#C8C0B8]"><Plus size={14} /></button>
                  <button onClick={() => removeItem(item.id)} className="bg-transparent border-none text-[#C0392B] cursor-pointer p-1 rounded-md transition-colors hover:bg-[#FDECEC]"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div> 
          <div className="px-5 py-4 bg-white border-t border-[var(--border)]">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-[15px] font-medium text-[var(--muted)]">Grand Total</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold">Rs {cartTotal.toLocaleString()}</span>
            </div>
            {cart.length > 0 && (
              <button onClick={continueShopping} className="w-full bg-white text-[var(--charcoal)] border-2 border-[var(--border)] rounded-full py-3.5 text-[15px] font-semibold cursor-pointer transition-colors mb-3 hover:border-[var(--charcoal)] hover:bg-[var(--cream)]">Continue Shopping</button>
            )}
            <button onClick={() => cart.length > 0 && setView('checkout')} disabled={cart.length === 0} className="w-full bg-[var(--accent)] text-white border-none rounded-full py-4 text-[15px] font-bold cursor-pointer transition-colors shadow-[0_4px_20px_rgba(200,149,108,0.4)] hover:bg-[var(--accent-dark)] disabled:bg-[#ccc] disabled:cursor-not-allowed disabled:shadow-none">Proceed to Confirm Order</button>
          </div>
        </>)}

        {view === 'checkout' && (
          <div className="flex-1 overflow-y-auto px-5 py-4 bg-[var(--cream)]">
            <button onClick={() => setView('cart')} className="bg-transparent border-none text-[var(--muted)] text-[13px] cursor-pointer flex items-center gap-1 mb-3.5 p-0 hover:text-[var(--charcoal)]"><ArrowLeft size={14} /> Back to Cart</button>
            <h3 className="font-['Playfair_Display'] text-lg font-bold mb-4">Delivery Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3.5"><label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-1.5">Full Name *</label><input name="name" required className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-white outline-none focus:border-[var(--accent)]" placeholder="Enter your full name" /></div>
              <div className="mb-3.5"><label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-1.5">Phone Number *</label><input name="phone" type="tel" required className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-white outline-none focus:border-[var(--accent)]" placeholder="e.g. 0331-1234567" /></div>
              <div className="mb-3.5"><label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-1.5">Delivery Address *</label><textarea name="address" required className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-white outline-none focus:border-[var(--accent)] resize-y min-h-[72px]" placeholder="House/Flat No, Street, Area, City" /></div>
              <div className="mb-3.5"><label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide block mb-1.5">Special Instructions</label><textarea name="instructions" className="w-full px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-white outline-none focus:border-[var(--accent)] resize-y min-h-[72px]" placeholder="Any special requests? (optional)" /></div>
              <button type="submit" disabled={submitting} className="w-full bg-[var(--charcoal)] text-white border-none rounded-full py-3.5 text-[15px] font-bold cursor-pointer mt-1 transition-colors hover:bg-[var(--warm-brown)] disabled:opacity-50">{submitting ? 'Placing Order...' : 'Place Order'}</button>
            </form>
          </div>
        )}

        {view === 'success' && (
          <div className="py-10 px-6 text-center">
            <div className="text-[var(--green)] mb-4"><ShoppingBag size={56} className="mx-auto" /></div>
            <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-2.5">Order Placed!</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">Thank you! <strong>DUOBRO MART</strong> will contact you on WhatsApp to confirm your order, availability, and delivery details.</p>
            <a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-[#25D366] text-white py-3 px-7 rounded-full text-[15px] font-bold transition-colors hover:bg-[#1DA851] shadow-[0_4px_20px_rgba(37,211,102,0.4)]"><MessageCircle size={20} /> Chat on WhatsApp</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Home Page ─── */
const featuredProducts = [
  { id:5, name:"Tie-Dye Burst Sling Bag", price:'Rs 2799', image:'https://i.ibb.co/R4QbjX8h/Whats-App-Image-2026-03-05-at-10-01-53-PM.jpg? auto=compress&cs=tinysrgb&w=400', discount: 20 },
  { id: 20, name: 'Pocket Pro Utility Belt Bag', price: 'Rs 1,099', image: 'https://i.ibb.co/mrdDbKRn/Whats-App-Image-2026-03-05-at-10-02-38-PM.jpg?auto=compress&cs=tinysrgb&w=400', discount: 18 },
  { id: 102, name: 'Stainless Cookware Set', price: 'Rs 2,549', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80?auto=compress&cs=tinysrgb&w=400', discount: 15 },
  { id: 2, name: 'Forest Trail Sling Bag', price: 'Rs 1,425', image: 'https://i.ibb.co/0p91sh0p/Whats-App-Image-2026-03-05-at-10-01-52-PM.jpg?auto=compress&cs=tinysrgb&w=400', discount: 25 },
];
const featureList = [
  { icon: <ShieldCheck size={48} className="text-[var(--accent)]" />, title: 'Quality Assured', desc: 'All products are carefully curated and quality-checked before delivery to ensure your satisfaction.' },
  { icon: <Truck size={48} className="text-[var(--accent)]" />, title: 'Quick Delivery', desc: 'Fast and reliable shipping across the region. We ensure your orders arrive in perfect condition.' },
  { icon: <MessageCircle size={48} className="text-[var(--accent)]" />, title: 'Customer Support', desc: 'Connect with us on WhatsApp for instant assistance and answers to all your questions.' },
];

function HomePage() {
  return (
    <div>
      <section className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center text-center mt-16">
        <img src="https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="DUOBRO MART" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(28,28,30,0.5)] via-[rgba(28,28,30,0.2)] to-[rgba(139,111,90,0.3)]" />
        <div className="relative z-[2] px-5 max-w-[640px] animate-[heroFadeIn_1s_ease_both]">
          <p className="text-[11px] font-semibold tracking-[4px] text-[rgba(255,255,255,0.8)] uppercase mb-4">Welcome to DUOBRO MART</p>
          <h1 className="font-['Playfair_Display'] text-[clamp(40px,8vw,80px)] font-bold text-white leading-[1.1] mb-4">Shop Easy. Live Better.</h1>
          <p className="text-base font-light text-[rgba(255,255,255,0.85)] mb-9 tracking-wide">Premium fashion, household essentials, and kitchen accessories in one place.</p>
          <Link to="/shop" className="inline-block bg-[var(--accent)] text-white py-4 px-10 rounded-full text-[15px] font-semibold tracking-wide shadow-[0_8px_32px_rgba(200,149,108,0.45)] transition-all duration-200 hover:bg-[var(--accent-dark)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(200,149,108,0.55)]">Explore Our Collection</Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[rgba(255,255,255,0.6)] text-[11px] tracking-[2px] uppercase text-center animate-[bounce_2s_infinite]"><ChevronDown size={16} className="mx-auto" />scroll</div>
      </section>

      <section className="py-16 px-5 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-['Playfair_Display'] text-[clamp(28px,5vw,44px)] font-bold mb-3">Featured Collections</h2>
          <p className="text-base text-[var(--muted)]">Discover our top-selling items with exclusive discounts</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 mb-12">
          {featuredProducts.map((p, i) => (
            <Link key={i} to={`/product/${p.id}`} className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(28,28,30,0.08)] border border-[var(--border)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(28,28,30,0.15)]">
              <div className="w-full aspect-square overflow-hidden bg-[#F0EBE5] relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-400 hover:scale-105" />
                <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#EF4444] text-white rounded-full w-10 h-10 md:w-14 md:h-14 flex flex-col items-center justify-center font-bold shadow-[0_4px_12px_rgba(239,68,68,0.3)]"><span className="text-sm md:text-lg leading-none">{p.discount}%</span><span className="text-[8px] md:text-[10px]">OFF</span></div>
              </div>
              <div className="p-3 md:p-4 flex flex-col gap-1 md:gap-2"><div className="text-[13px] md:text-[15px] font-semibold">{p.name}</div><div className="font-['Playfair_Display'] text-sm md:text-lg font-bold text-[var(--accent-dark)]">{p.price}</div></div>
            </Link>
          ))}
        </div>
        <Link to="/shop" className="block mx-auto w-fit bg-[var(--accent)] text-white py-4 px-10 rounded-full text-[15px] font-semibold shadow-[0_8px_32px_rgba(200,149,108,0.45)] transition-all duration-200 hover:bg-[var(--accent-dark)] hover:-translate-y-0.5">View All Products <ArrowRight size={16} className="inline ml-1" /></Link>
      </section>

      <section className="py-16 px-5 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
          {featureList.map((f, i) => <div key={i} className="text-center"><div className="mb-4 flex justify-center">{f.icon}</div><h3 className="font-['Playfair_Display'] text-xl font-bold mb-2">{f.title}</h3><p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p></div>)}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[var(--charcoal)] to-[#2D2D2F] text-white py-16 px-5">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="font-['Playfair_Display'] text-[clamp(28px,5vw,40px)] font-bold mb-4">Become a Vendor</h2>
          <p className="text-[15px] leading-relaxed mb-8 opacity-90">Are you a supplier or manufacturer? Join our growing network of vendors and reach thousands of customers.</p>
          <Link to="/vendor-register" className="inline-block bg-[var(--accent)] text-white py-3.5 px-9 rounded-full text-sm font-bold transition-all duration-200 hover:bg-[var(--accent-dark)] hover:-translate-y-0.5">Register as a Vendor</Link>
        </div>
      </section>
    </div>
  );
}

/* ─── Shop Page ─── */
interface Product { id: number; name: string; price: number; category: string; group: string; image: string; discount: number; desc: string }
const PRODUCTS: Product[] = [
  { id:1, name:"Baby Quilt", price:1299, category:"Baby Products", group:"fashion", image:"https://i.ibb.co/LzGTr07S/Whats-App-Image-2026-03-05-at-10-01-34-PM.jpg", discount:0, desc:"Soft, breathable quilt designed for baby comfort. Gentle on delicate skin with cozy padding for peaceful sleep." },
  { id:2, name:"Forest Trail Sling Bag", price:1899, category:"Women", group:"fashion", image:"https://i.ibb.co/0p91sh0p/Whats-App-Image-2026-03-05-at-10-01-52-PM.jpg", discount:25, desc:`A beautifully designed messenger bag featuring a vivid pine forest print in shades of teal, blue, and sunset orange, with "Michigan" embroidered in gold cursive on both sides of the flap. The flap and body are finished with detailed quilting for a soft, textured look and added durability. The bag body is made from a soft, suede-like brown fabric with a classic diamond quilt pattern, paired with a matching printed adjustable shoulder strap for comfortable everyday carry. Spacious enough for daily essentials, this bag is a unique blend of rustic style and artistic flair — perfect for anyone who loves nature-inspired accessories.
  Features: Quilted fabric construction, Adjustable shoulder strap, Spacious main compartment with flap closure, Vivid printed Michigan-themed design.` },
  { id:3, name:"Bumblebee Sling Bag", price:1599, category:"Men", group:"fashion", image:"https://i.ibb.co/m5kxLqNH/Whats-App-Image-2026-03-05-at-10-01-52-PM.jpg",discount:0, desc:"Tailored slim-fit chinos in premium stretch cotton. Versatile for casual and semi-formal wear." },
  { id:4, name:"Vintage Map Sling Bag", price:2199, category:"Women", group:"fashion", image:"https://i.ibb.co/nN6g7xTq/Whats-App-Image-2026-03-05-at-10-01-53-PM.jpg",discount:0,desc:"Handcrafted embroidery on soft cotton fabric" },
  { id:5, name:"Tie-Dye Burst Sling Bag", price:2799, category:"Unisex", group:"fashion", image:"https://i.ibb.co/R4QbjX8h/Whats-App-Image-2026-03-05-at-10-01-53-PM.jpg", discount:20, desc:"Premium washed denim with classic fit" },
  { id:6, name:"Coffee Lover Sling Bag", price:699, category:"Kids", group:"fashion", image:"https://i.ibb.co/4RfP15BJ/Whats-App-Image-2026-03-05-at-10-01-53-PM.jpg", discount:0, desc:"Soft discount:0cotton tee with fun printed graphics" },
  { id:7, name:"Teal Cake Print Backpack Set", price:4499, category:"Men", group:"fashion", image:"https://i.ibb.co/Y79sMzfd/Whats-App-Image-2026-03-05-at-10-02-16-PM.jpg", discount:0, desc:"Smart casual blazer with modern tailoring" },
  { id:8, name:"Rust Plaid Backpack Set", price:1399, category:"Women", group:"fashion", image:"https://i.ibb.co/XZ0nS6k9/Whats-App-Image-2026-03-05-at-10-02-20-PM.jpg", discount:0, desc:"Flowy pleated skirt in earthy neutral tones" },
  { id:9, name:"Gold Tile Print Backpack Set", price:1799, category:"Unisex", group:"fashion", image:"https://i.ibb.co/bjCh5t77/Whats-App-Image-2026-03-05-at-10-02-21-PM.jpg", discount:0, desc:"Cozy fleece-lined hoodie for colder days" },
  { id:10, name:"Pokemon Sticker Backpack Set", price:999, category:"Kids", group:"fashion", image:"https://i.ibb.co/gFSjgFzZ/Whats-App-Image-2026-03-05-at-10-02-28-PM.jpg",discount:0, desc:"Adorable printed frock with matching hairband" },
  { id:11, name:"Sage Green Quilted Backpack Set", price:3299, category:"Women", group:"fashion", image:"https://i.ibb.co/mr2FWjBC/Whats-App-Image-2026-03-05-at-10-02-29-PM.jpg", discount:0, desc:"Matching linen shirt and wide-leg trouser set" },
  { id:12, name:"Cartoon Characters Backpack Set", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/9HnpR9fv/Whats-App-Image-2026-03-05-at-10-02-30-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:13, name:"Dark Galaxy Print Backpack Set", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/F4bFxKMG/Whats-App-Image-2026-03-05-at-10-02-35-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:14, name:"Neon Swirl School Bag", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/cKQj0jRK/Whats-App-Image-2026-03-05-at-10-02-30-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:15, name:"Men's Plaid Casual Shirt", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/5WFsqX5h/Whats-App-Image-2026-03-05-at-10-02-37-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:16, name:"Fruit Tapestry Tote Bag", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/DDBSDwyb/Whats-App-Image-2026-03-05-at-10-02-35-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:17, name:"Men's Light Blue Kurta", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/kVh3LPMZ/Whats-App-Image-2026-03-05-at-10-02-37-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:18, name:"Men's White Classic Kurta", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/dwW04xHR/Whats-App-Image-2026-03-05-at-10-02-38-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:19, name:"Polka Dot Drawstring Bag", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/1t36hF82/Whats-App-Image-2026-03-05-at-10-02-38-PM.jpg", discount:0, desc:"Breathable pique polo with subtle pattern" },
  { id:20, name:"Pocket Pro Utility Belt Bag", price:1099, category:"Men", group:"fashion", image:"https://i.ibb.co/mrdDbKRn/Whats-App-Image-2026-03-05-at-10-02-38-PM.jpg", discount:18, desc:"Breathable pique polo with subtle pattern" },
  { id:101, name:"Non-Stick Fry Pan", price:1499, category:"Utensils", group:"kitchen", image:"",discount:0, desc:"Durable non-stick coating for healthy cooking" },
  { id:102, name:"Stainless Steel Pot Set", price:2999, category:"Utensils", group:"kitchen", image:"", discount: 15, desc:"5-piece cookware set with tempered glass lids" },
  { id:103, name:"Wooden Spoon Set", price:499, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"Natural wood kitchen tools - 6-piece set" },
  { id:104, name:"Pressure Cooker 5L", price:3499, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"Heavy-gauge aluminium body with safety valve" },
  { id:105, name:"Silicone Spatula Set", price:699, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"Heat-resistant silicone, dishwasher safe" },
  { id:106, name:"Stainless Mixing Bowls", price:1199, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"3 sizes with non-slip base and pour spout" },
  { id:107, name:"Wok with Lid", price:1899, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"Pre-seasoned carbon steel for stir fry" },
  { id:108, name:"Knife Block Set", price:2599, category:"Utensils", group:"kitchen", image:"", discount:0, desc:"6-piece stainless blades with wooden block" },
  { id:401, name:"2-Burner Gas Stove", price:3999, category:"Stoves", group:"kitchen", image:"", discount:0, desc:"Double burner LPG stove with auto-ignition" },
  { id:402, name:"3-Burner Gas Stove", price:5499, category:"Stoves", group:"kitchen", image:"", discount:0, desc:"Triple burner with cast iron pan supports" },
  { id:403, name:"Single Electric Hotplate", price:2299, category:"Stoves", group:"kitchen", image:"", discount:0, desc:"Portable 1000W coil hotplate" },
  { id:404, name:"Induction Cooktop", price:6999, category:"Stoves", group:"kitchen", image:"", discount:0, desc:"2000W touch-control induction cooker" },
  { id:301, name:"Foldable Drying Rack", price:1799, category:"Drying Stands", group:"household", image:"", discount:0, desc:"Stainless steel bars, folds flat for storage" },
  { id:302, name:"3-Tier Tower Clothes Airer", price:2299, category:"Drying Stands", group:"household", image:"", discount:0,desc:"Tall 3-tier rack for full family wash load" },
  { id:303, name:"Ceiling Pulley Drying Rack", price:2799, category:"Drying Stands", group:"household", image:"", discount:0, desc:"Wall-mounted pulley system saves floor space" },
  { id:304, name:"Portable Garment Stand", price:1499, category:"Drying Stands", group:"household", image:"", discount:0, desc:"Single rail with bottom shoe rack" },
  { id:305, name:"Retractable Wall Dryer", price:1999, category:"Drying Stands", group:"household", image:"", discount:0, desc:"5 extendable arms, mounts indoors or outdoors" },
];
const GROUPS = [{ key: 'all', label: 'All Products' }, { key: 'fashion', label: 'Fashion' }, { key: 'household', label: 'Household' }, { key: 'kitchen', label: 'Kitchen' }, { key: 'beauty', label: 'Beauty' }];

function ShopPage() {
  const { addToCart } = useCart();
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeSubCat, setActiveSubCat] = useState('all');
  const [addedId, setAddedId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const subCats = activeGroup === 'all' ? [...new Set(PRODUCTS.map((p) => p.category))].sort() : [...new Set(PRODUCTS.filter((p) => p.group === activeGroup).map((p) => p.category))].sort();
  const filtered = PRODUCTS.filter((p) => (activeGroup === 'all' || p.group === activeGroup) && (activeSubCat === 'all' || p.category === activeSubCat));
  const handleAdd = (p: Product) => { addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, discount: p.discount || 0 }); setAddedId(p.id); setToast(`${p.name} added to cart`); setTimeout(() => setAddedId(null), 1500); setTimeout(() => setToast(''), 2200); };
  useEffect(() => { setActiveSubCat('all'); }, [activeGroup]);

  return (
    <div className="pt-20">
      <div className="max-w-[1200px] mx-auto px-5 py-8">
        <div className="mb-6"><h2 className="font-['Playfair_Display'] text-[clamp(26px,5vw,40px)] font-bold">Our Collection</h2><p className="text-[13px] text-[var(--muted)] mt-1">Fashion & household essentials, curated for you</p></div>
        <div className="flex gap-2 flex-wrap mb-3">
          {GROUPS.map((g) => <button key={g.key} onClick={() => setActiveGroup(g.key)} className={`px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-200 ${activeGroup === g.key ? (g.key === 'household' ? 'bg-[var(--teal)] border-[var(--teal)] text-white' : g.key === 'kitchen' ? 'bg-[var(--kitchen)] border-[var(--kitchen)] text-white' : g.key === 'beauty' ? 'bg-[#D4639A] border-[#D4639A] text-white' : 'bg-[var(--charcoal)] border-[var(--charcoal)] text-white') : 'bg-white border-[var(--border)] text-[var(--charcoal)] hover:border-[var(--accent)] hover:text-[var(--accent-dark)]'}`}>{g.label}</button>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-7 p-3 bg-white border border-[var(--border)] rounded-[10px]">
          <span className="text-[10px] font-bold tracking-[1.2px] text-[var(--muted)] uppercase mr-1">Filter:</span>
          <button onClick={() => setActiveSubCat('all')} className={`px-4 py-1.5 rounded-full border-[1.5px] text-xs font-medium transition-all duration-200 ${activeSubCat === 'all' ? 'bg-[var(--charcoal)] text-white border-[var(--charcoal)]' : 'bg-[var(--cream)] border-[var(--border)] text-[var(--charcoal)] hover:border-[var(--accent)]'}`}>All</button>
          {subCats.map((c) => <button key={c} onClick={() => setActiveSubCat(c)} className={`px-4 py-1.5 rounded-full border-[1.5px] text-xs font-medium transition-all duration-200 ${activeSubCat === c ? (activeGroup === 'household' ? 'bg-[var(--teal)] text-white border-[var(--teal)]' : activeGroup === 'kitchen' ? 'bg-[var(--kitchen)] text-white border-[var(--kitchen)]' : activeGroup === 'beauty' ? 'bg-[#D4639A] text-white border-[#D4639A]' : 'bg-[var(--charcoal)] text-white border-[var(--charcoal)]') : 'bg-[var(--cream)] border-[var(--border)] text-[var(--charcoal)] hover:border-[var(--accent)]'}`}>{c}</button>)}
        </div>
        {filtered.length === 0 ? <div className="text-center py-12 text-[var(--muted)]">No products in this category yet.</div> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <div key={p.id} className={`bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(28,28,30,0.08)] border border-[var(--border)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(28,28,30,0.15)] flex flex-col ${p.group === 'household' ? 'border-l-[3px] border-l-[#B8D9D3]' : ''} ${p.group === 'kitchen' ? 'border-l-[3px] border-l-[#F4C49A]' : ''}`}>
                <Link to={`/product/${p.id}`} className={`w-full overflow-hidden bg-[#F0EBE5] relative aspect-square`}>
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-400 hover:scale-105" />
                  <span className={`absolute top-1.5 left-1.5 md:top-2.5 md:left-2.5 text-[8px] md:text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 md:px-2.5 md:py-1 rounded-full backdrop-blur-[8px] ${p.group === 'household' ? 'text-[var(--teal)] bg-[rgba(237,246,244,0.95)]' : p.group === 'kitchen' ? 'text-[var(--kitchen)] bg-[rgba(253,240,232,0.95)]' : p.group === 'beauty' ? 'text-[#D4639A] bg-[rgba(252,236,246,0.95)]' : 'text-[var(--warm-brown)] bg-[rgba(250,248,244,0.92)]'}`}>{p.category}</span>
                </Link>
                <div className="p-2.5 md:p-3.5 flex flex-col gap-1 flex-1">
                  <Link to={`/product/${p.id}`} className="text-xs md:text-sm font-semibold leading-snug hover:text-[var(--accent)] transition-colors">{p.name}</Link>
                  <div className="font-['Playfair_Display'] text-sm md:text-lg font-bold text-[var(--accent-dark)] mt-0.5">Rs {p.price.toLocaleString()}</div>
                  <button onClick={() => handleAdd(p)} className={`mt-1.5 md:mt-2.5 w-full py-2 md:py-2.5 rounded-full text-[11px] md:text-[13px] font-semibold border-none cursor-pointer transition-all duration-200 ${addedId === p.id ? 'bg-[var(--green)] text-white' : 'bg-[var(--charcoal)] text-white hover:bg-[var(--warm-brown)]'}`}>{addedId === p.id ? 'Added' : 'Add to Cart'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-6 right-5 flex flex-col items-end gap-3 z-[150]">
        <a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="w-[52px] h-[52px] rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(28,28,30,0.2)] transition-all duration-200 hover:scale-110" title="Chat on WhatsApp"><MessageCircle size={24} /></a>
      </div>
      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[var(--charcoal)] text-white px-5 py-2.5 rounded-full text-[13px] font-medium z-[300] whitespace-nowrap pointer-events-none">{toast}</div>}
    </div>
  );
}

/* ─── Product Detail Page ─── */
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setCartOpen } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const product = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) return (
    <div className="max-w-[900px] mx-auto px-5 pt-24 pb-16 text-center">
      <h2 className="font-['Playfair_Display'] text-3xl font-bold mb-4">Product Not Found</h2>
      <p className="text-[var(--muted)] mb-6">The product you are looking for does not exist or has been removed.</p>
      <Link to="/shop" className="inline-block bg-[var(--accent)] text-white py-3 px-8 rounded-full text-sm font-bold hover:bg-[var(--accent-dark)] transition-colors">Back to Shop</Link>
    </div>
  );

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, discount: product.discount });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-20">
      <div className="max-w-[1200px] mx-auto px-5 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--muted)] mb-6 bg-transparent border-none cursor-pointer hover:text-[var(--charcoal)] transition-colors p-0"><ArrowLeft size={16} /> Back</button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className={`w-full overflow-hidden bg-[#F0EBE5] rounded-2xl ${product.group !== 'fashion' ? 'aspect-[4/3]' : 'aspect-[3/4] md:aspect-auto md:min-h-[480px]'}`}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <span className={`inline-block w-fit text-[10px] font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full ${product.group === 'household' ? 'text-[var(--teal)] bg-[rgba(237,246,244,0.95)]' : product.group === 'kitchen' ? 'text-[var(--kitchen)] bg-[rgba(253,240,232,0.95)]' : product.group === 'beauty' ? 'text-[#D4639A] bg-[rgba(252,236,246,0.95)]' : 'text-[var(--warm-brown)] bg-[rgba(250,248,244,0.92)]'}`}>{product.category}</span>
            <h1 className="font-['Playfair_Display'] text-[clamp(28px,5vw,42px)] font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {product.discount ? (
                <>
                  <div className="font-['Playfair_Display'] text-3xl font-bold text-[var(--accent-dark)]">Rs {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}</div>
                  <div className="font-['Playfair_Display'] text-xl font-medium text-[var(--muted)] line-through">Rs {product.price.toLocaleString()}</div>
                  <div className="bg-[#EF4444] text-white text-sm font-bold px-3 py-1 rounded-full">{product.discount}% OFF</div>
                </>
              ) : (
                <div className="font-['Playfair_Display'] text-3xl font-bold text-[var(--accent-dark)]">Rs {product.price.toLocaleString()}</div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[var(--accent)]">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < 4 ? 'currentColor' : 'none'} />)}
              <span className="text-sm text-[var(--muted)] ml-2">4.0 / 5</span>
            </div>
            <p className="text-[15px] text-[var(--charcoal)] leading-relaxed">{product.desc || 'High-quality product curated for your satisfaction. Carefully sourced and quality-checked before delivery.'}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-semibold text-[var(--muted)]">Quantity</span>
              <div className="flex items-center gap-3 bg-[var(--cream)] border border-[var(--border)] rounded-full px-2 py-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="bg-[var(--border)] border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#C8C0B8] transition-colors"><Minus size={14} /></button>
                <span className="text-base font-bold min-w-[28px] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="bg-[var(--border)] border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#C8C0B8] transition-colors"><Plus size={14} /></button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={handleAdd} className={`flex-1 py-3.5 rounded-full text-[15px] font-bold border-none cursor-pointer transition-all duration-200 ${added ? 'bg-[var(--green)] text-white' : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] shadow-[0_4px_20px_rgba(200,149,108,0.4)]'}`}>{added ? 'Added to Cart!' : 'Add to Cart'}</button>
              <button onClick={() => { handleAdd(); setCartOpen(true); }} className="flex-1 py-3.5 rounded-full text-[15px] font-bold border-2 border-[var(--charcoal)] bg-white text-[var(--charcoal)] cursor-pointer transition-all duration-200 hover:bg-[var(--charcoal)] hover:text-white">Buy Now</button>
            </div>
            <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-sm"><ShieldCheck size={20} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">Quality assured and verified products</span></div>
              <div className="flex items-center gap-3 text-sm"><Truck size={20} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">Fast and reliable delivery across Pakistan</span></div>
              <div className="flex items-center gap-3 text-sm"><MessageCircle size={20} className="text-[var(--accent)]" /><span className="text-[var(--muted)]">WhatsApp support for order assistance</span></div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="font-['Playfair_Display'] text-[clamp(22px,4vw,32px)] font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(28,28,30,0.08)] border border-[var(--border)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(28,28,30,0.15)] flex flex-col">
                  <div className="w-full overflow-hidden bg-[#F0EBE5] relative aspect-square">
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                    <span className={`absolute top-1.5 left-1.5 md:top-2.5 md:left-2.5 text-[8px] md:text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 md:px-2.5 md:py-1 rounded-full backdrop-blur-[8px] ${p.group === 'household' ? 'text-[var(--teal)] bg-[rgba(237,246,244,0.95)]' : p.group === 'kitchen' ? 'text-[var(--kitchen)] bg-[rgba(253,240,232,0.95)]' : p.group === 'beauty' ? 'text-[#D4639A] bg-[rgba(252,236,246,0.95)]' : 'text-[var(--warm-brown)] bg-[rgba(250,248,244,0.92)]'}`}>{p.category}</span>
                  </div>
                  <div className="p-2.5 md:p-3.5 flex flex-col gap-1 flex-1">
                    <div className="text-xs md:text-sm font-semibold leading-snug">{p.name}</div>
                    <div className="font-['Playfair_Display'] text-sm md:text-lg font-bold text-[var(--accent-dark)] mt-0.5">Rs {p.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-6 right-5 flex flex-col items-end gap-3 z-[150]">
        <a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="w-[52px] h-[52px] rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(28,28,30,0.2)] transition-all duration-200 hover:scale-110" title="Chat on WhatsApp"><MessageCircle size={24} /></a>
      </div>
    </div>
  );
}

/* ─── Terms Buyers Page ─── */
function TermsBuyersPage() {
  return (
    <div className="max-w-[900px] mx-auto px-5 pt-24 pb-16">
      <div className="text-center mb-12">
        <h1 className="font-['Playfair_Display'] text-[clamp(32px,5vw,48px)] font-bold mb-3">Terms & Conditions</h1>
        <p className="text-base text-[var(--muted)]">Customer Rights & Responsibilities</p>
        <p className="text-sm text-[var(--muted)] mt-2">Last updated: June 2026</p>
      </div>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">1. Introduction & Acceptance of Terms</h2>
        <p className="leading-relaxed text-[15px] mb-3">Welcome to DUOBRO MART ("we", "us", or "our"). These Terms & Conditions govern your use of our website and any purchase made through our platform. By browsing, registering, or placing an order on DUOBRO MART, you confirm that you have read, understood, and agree to be bound by these terms in their entirety.</p>
        <p className="leading-relaxed text-[15px]">If you do not agree with any part of these terms, you must discontinue use of our platform immediately. We reserve the right to update these terms at any time, and continued use of the platform after changes constitutes your acceptance of the revised terms.</p>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">2. Eligibility</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Age Requirement:</strong> You must be at least 18 years of age, or have parental/guardian consent, to place an order on DUOBRO MART.</li>
          <li><strong>Accurate Registration:</strong> You agree to provide accurate, current, and complete information when submitting orders or registering on our platform.</li>
          <li><strong>Geographic Availability:</strong> Our services are currently available within Pakistan. Orders from outside this region may not be fulfilled.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">3. Order Placement & Confirmation</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Order Confirmation:</strong> Upon successful submission of your order, DUOBRO MART shall process and confirm your order within a maximum period of twenty-four (24) hours. Confirmation will be communicated via WhatsApp using the contact number provided at the time of order placement. Orders submitted outside of business hours or on public holidays shall be confirmed within the next available business day, without exceeding the 24-hour window.</li>
          <li><strong>Order Acceptance:</strong> Submission of an order constitutes an offer to purchase. DUOBRO MART reserves the right to accept or decline any order at its discretion, including cases where a product becomes unavailable after submission.</li>
          <li><strong>Order Cancellation:</strong> Customers may request cancellation of an order before it has been dispatched by contacting us via WhatsApp. Once an order has been shipped, cancellation is no longer possible.</li>
          <li><strong>Incorrect Contact Details:</strong> If confirmation is not received within 24 hours, customers are advised to verify their contact information and reach out to DUOBRO MART support directly.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">4. Pricing & Payment</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Displayed Prices:</strong> All prices are listed in Pakistani Rupees (PKR) and are inclusive of any applicable taxes unless stated otherwise. Prices are subject to change without prior notice.</li>
          <li><strong>Payment Methods:</strong> Accepted payment methods (cash on delivery, bank transfer, etc.) will be communicated during the order confirmation process.</li>
          <li><strong>Cash on Delivery (COD):</strong> Where COD is offered, full payment must be made to the delivery representative at the time of receiving your order. Refusal to pay upon delivery may result in your account being restricted from future orders.</li>
          <li><strong>Pricing Errors:</strong> In the event of an error in pricing, DUOBRO MART reserves the right to cancel the affected order and notify the customer accordingly.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">5. Delivery & Shipping</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Delivery Timeframe:</strong> Estimated delivery times will be provided upon order confirmation. Timelines may vary based on your location, product availability, and vendor capacity. DUOBRO MART is not liable for delays caused by third-party logistics providers or circumstances beyond our control.</li>
          <li><strong>Delivery Address:</strong> Customers are responsible for providing a complete, accurate, and accessible delivery address. DUOBRO MART is not responsible for non-delivery resulting from incorrect address information.</li>
          <li><strong>Failed Delivery Attempts:</strong> If a delivery attempt is unsuccessful due to the customer's unavailability or incorrect address, re-delivery fees may apply.</li>
          <li><strong>Risk of Loss:</strong> Risk of loss or damage to products passes to the customer upon successful delivery.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">6. Returns, Exchanges & Refunds</h2>
        <div className="bg-[#FDF0E8] border-l-4 border-[var(--accent)] p-5 mb-5 rounded-lg">
          <h4 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-[var(--accent)]" /> Important — Read Before Ordering</h4>
          <p className="text-sm leading-relaxed">Return and refund eligibility is determined on a case-by-case basis. Customers are encouraged to thoroughly review product descriptions, images, and specifications before placing an order.</p>
        </div>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Damaged or Incorrect Items:</strong> If you receive a product that is damaged, defective, or significantly different from the listing, you must report the issue within 48 hours of delivery via WhatsApp with photographic evidence.</li>
          <li><strong>Non-Returnable Items:</strong> Certain product categories (e.g., personal care, undergarments, perishable goods) are non-returnable for hygiene and safety reasons.</li>
          <li><strong>Refund Processing:</strong> Approved refunds will be processed within 5–7 business days via the original payment method or an agreed alternative.</li>
          <li><strong>Change of Mind:</strong> DUOBRO MART does not guarantee returns or refunds for change-of-mind purchases. Please order carefully.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">7. Product Listings & Accuracy</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Product Information:</strong> DUOBRO MART makes every effort to ensure product descriptions, images, and prices are accurate. However, we do not warrant that all content is error-free or complete.</li>
          <li><strong>Colour Disclaimer:</strong> Actual product colours may vary slightly from images displayed on screen due to differences in display settings and lighting conditions.</li>
          <li><strong>Stock Availability:</strong> Products are subject to availability. In the event that a product is out of stock after your order is placed, you will be notified and offered an alternative or a full refund.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">8. Privacy & Data Usage</h2>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Data Collection:</strong> By placing an order, you consent to DUOBRO MART collecting and using your name, contact number, and delivery address solely for the purpose of fulfilling your order and providing customer support.</li>
          <li><strong>Data Sharing:</strong> Your personal information will not be sold or shared with third parties for marketing purposes. It may be shared with delivery partners strictly for fulfillment purposes.</li>
          <li><strong>Communications:</strong> By submitting your contact number, you agree to receive order-related communications via WhatsApp. You may opt out of promotional messages at any time.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">9. Prohibited Conduct</h2>
        <p className="leading-relaxed text-[15px] mb-3">Customers must not engage in any of the following:</p>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li>Placing fraudulent, false, or duplicate orders with no intention to complete payment</li>
          <li>Using abusive, threatening, or inappropriate language towards DUOBRO MART staff or vendors</li>
          <li>Attempting to manipulate pricing, discount codes, or promotional offers dishonestly</li>
          <li>Impersonating another person or providing false identity information</li>
        </ul>
        <p className="leading-relaxed text-[15px] mt-3">Violation of any of the above may result in immediate suspension of your account and refusal of future orders. If you believe your account has been suspended in error, you may submit a written appeal to duobroelite@gmail.com within 7 days of notification, and DUOBRO MART will review the matter in good faith.</p>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">10. Limitation of Liability</h2>
        <p className="leading-relaxed text-[15px] mb-3">DUOBRO MART operates as an e-commerce platform and marketplace. To the fullest extent permitted by applicable law, DUOBRO MART shall not be liable for:</p>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li>Indirect, incidental, or consequential damages arising from the use or inability to use our platform</li>
          <li>Product quality issues originating from the vendor or manufacturer</li>
          <li>Delays, loss, or damage during transit handled by third-party logistics providers</li>
          <li>Losses arising from incorrect information provided by the customer</li>
          <li>Temporary unavailability of the website due to maintenance or technical issues</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">11. Intellectual Property</h2>
        <p className="leading-relaxed text-[15px]">All content on DUOBRO MART — including but not limited to the brand name, logo, product images, and website design — is the intellectual property of DUOBRO MART and may not be reproduced, distributed, or used without express written consent.</p>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">12. Governing Law</h2>
        <p className="leading-relaxed text-[15px]">These Terms & Conditions shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. For dispute resolution procedures, please refer to Section 13 below. Any disputes not resolved through that process shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan.</p>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">13. Dispute Resolution & Complaints</h2>
        <p className="leading-relaxed text-[15px] mb-3">DUOBRO MART is committed to resolving customer concerns promptly and fairly. In the event of a dispute or complaint, the following process applies:</p>
        <ul className="ml-5 space-y-2 text-[15px]">
          <li><strong>Step 1 — Contact Support:</strong> Customers must first raise their concern directly with DUOBRO MART via WhatsApp (+92 331 3146400) or email (duobroelite@gmail.com), providing full details of the issue along with any relevant evidence (e.g., photos, order reference).</li>
          <li><strong>Step 2 — Resolution Period:</strong> DUOBRO MART will acknowledge the complaint within 48 hours and endeavour to provide a resolution within 5 business days of receiving complete information.</li>
          <li><strong>Step 3 — Escalation:</strong> If the matter remains unresolved after the above process, both parties agree to attempt resolution through good-faith negotiation before pursuing any formal legal proceedings.</li>
          <li><strong>Jurisdiction:</strong> Any unresolved disputes shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan, in accordance with the laws of the Islamic Republic of Pakistan.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">14. Amendments to Terms</h2>
        <p className="leading-relaxed text-[15px]">DUOBRO MART reserves the right to amend, update, or replace these Terms & Conditions at any time without prior notice. The revised version will be posted on this page with an updated effective date. It is the customer's responsibility to review these terms periodically. Continued use of the platform following any amendments constitutes acceptance of the updated terms.</p>
      </section>

      <div className="bg-[var(--charcoal)] text-white p-8 rounded-2xl text-center mt-12">
        <h3 className="font-['Playfair_Display'] text-2xl mb-4">Questions? Let's Connect</h3>
        <p className="leading-relaxed mb-4">We're here to help and ensure you have a great shopping experience.</p>
        <div className="flex gap-5 justify-center flex-wrap mt-5">
          <a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold transition-opacity hover:opacity-80"><Phone size={16} /> WhatsApp: +92 331 3146400</a>
          <a href="mailto:duobroelite@gmail.com" className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold transition-opacity hover:opacity-80"><Mail size={16} /> Email: duobroelite@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

/* ─── Vendor Register Page ─── */
function VendorRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState('');
  const [cnicBackPreview, setCnicBackPreview] = useState('');
  const handleFileChange = (setter: (f: File | null) => void, previewSetter: (u: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setter(null); previewSetter(''); return; }
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg');
    if (!isJpg) { setError('Only JPG/JPEG images are accepted'); setter(null); previewSetter(''); e.target.value = ''; return; }
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10 MB'); setter(null); previewSetter(''); e.target.value = ''; return; }
    setError(''); setter(file); previewSetter(URL.createObjectURL(file));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    const fd = new FormData(e.target as HTMLFormElement);
    const email = fd.get('email') as string;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); setSubmitting(false); return; }
    if ((fd.get('phone') as string).length < 10) { setError('Please enter a valid phone number'); setSubmitting(false); return; }
    if (!cnicFront) { setError('Front side of CNIC is required for identity verification'); setSubmitting(false); return; }
    if (!cnicBack) { setError('Back side of CNIC is required for identity verification'); setSubmitting(false); return; }
    if (!fd.get('agreeTerms')) { setError('You must agree to the vendor terms'); setSubmitting(false); return; }
    const data: Record<string, string> = { _subject: `New Vendor Registration: ${fd.get('businessName')}`, 'First Name': fd.get('firstName') as string, 'Last Name': fd.get('lastName') as string, Email: email, Phone: fd.get('phone') as string, 'Business Name': fd.get('businessName') as string, 'Business Type': fd.get('businessType') as string, City: fd.get('city') as string, Province: fd.get('province') as string, 'Business Address': fd.get('businessAddress') as string, 'Product Description': fd.get('productDescription') as string, 'Experience (Years)': (fd.get('experience') as string) || '0', 'Marketing Consent': fd.get('agreeMarketing') === 'on' ? 'Yes' : 'No', 'Registration Date': new Date().toISOString() };
    try {
      const sd = new FormData(); Object.entries(data).forEach(([k, v]) => sd.append(k, v));
      const res = await fetch('https://formspree.io/f/xojvqpqr', { method: 'POST', body: sd, headers: { Accept: 'application/json' } });
      if (res.ok) { setSuccess(true); (e.target as HTMLFormElement).reset(); setCnicFront(null); setCnicBack(null); setCnicFrontPreview(''); setCnicBackPreview(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else setError('Failed to submit application. Please try again.');
    } catch { setError('Network error. Please check your connection.'); }
    finally { setSubmitting(false); }
  };
  return (
    <div className="max-w-[900px] mx-auto px-5 pt-24 pb-16">
      <div className="text-center mb-12"><h1 className="font-['Playfair_Display'] text-[clamp(32px,5vw,48px)] font-bold mb-3">Become a Vendor</h1><p className="text-base text-[var(--muted)]">Join our growing network and reach thousands of customers</p></div>
      <div className="bg-[#FDF0E8] border-l-4 border-[var(--accent)] p-5 my-6 rounded-lg"><h4 className="font-bold mb-2">Why Become a Vendor?</h4><p className="text-sm leading-relaxed">DUOBRO MART provides a platform for suppliers and manufacturers to showcase their products to a wide audience.</p></div>
      {success && <div className="bg-[#D1FAE5] border border-[#6EE7B7] text-[#047857] p-5 rounded-[10px] mb-6 text-center"><CheckCircle size={32} className="mx-auto mb-2" /><h3 className="text-lg font-bold">Thank you for registering!</h3><p className="mt-2">We have received your application and will review it shortly.</p></div>}
      {!success && (
        <div className="bg-white border border-[var(--border)] rounded-2xl p-8 sm:p-10 shadow-[0_4px_24px_rgba(28,28,30,0.08)] mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-6">
              <h3 className="col-span-full text-lg font-bold mb-0">Personal Information</h3>
              <div className="flex flex-col"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">First Name *</label><input name="firstName" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="Enter your first name" /></div>
              <div className="flex flex-col"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Last Name *</label><input name="lastName" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="Enter your last name" /></div>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Email Address *</label><input name="email" type="email" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="your.email@example.com" /></div>
              <div className="flex flex-col"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Phone Number *</label><input name="phone" type="tel" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="0331-1234567" /></div>
              <h3 className="col-span-full text-lg font-bold mt-4 mb-0">Identity Verification (CNIC)</h3>
              <p className="col-span-full text-[13px] text-[var(--muted)] mb-2">Upload clear photos of your National ID Card (CNIC) for identity verification. Accepted format: JPG/JPEG only, max size: 10 MB.</p>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Front of CNIC *</label>
                <label className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[10px] cursor-pointer transition-all duration-200 overflow-hidden ${cnicFrontPreview ? 'border-[var(--accent)] bg-[var(--cream)]' : 'border-[var(--border)] bg-[var(--cream)] hover:border-[var(--accent)] hover:bg-[rgba(200,149,108,0.05)]'}`} style={{ minHeight: '160px' }}>
                  {cnicFrontPreview ? (
                    <><img src={cnicFrontPreview} alt="CNIC Front" className="w-full h-full object-cover absolute inset-0" /><div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-sm font-semibold">Change Photo</span></div></>
                  ) : (
                    <><span className="text-2xl mb-1 text-[var(--muted)]">+</span><span className="text-xs text-[var(--muted)] font-medium">Click to upload front side</span><span className="text-[10px] text-[var(--muted)] mt-1">JPG/JPEG, max 10 MB</span></>
                  )}
                  <input type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden" onChange={(e) => handleFileChange(setCnicFront, setCnicFrontPreview, e)} />
                </label>
                {cnicFront && <span className="text-[11px] text-[var(--muted)] mt-1.5 truncate">{cnicFront.name} ({(cnicFront.size / 1024 / 1024).toFixed(2)} MB)</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Back of CNIC *</label>
                <label className={`group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[10px] cursor-pointer transition-all duration-200 overflow-hidden ${cnicBackPreview ? 'border-[var(--accent)] bg-[var(--cream)]' : 'border-[var(--border)] bg-[var(--cream)] hover:border-[var(--accent)] hover:bg-[rgba(200,149,108,0.05)]'}`} style={{ minHeight: '160px' }}>
                  {cnicBackPreview ? (
                    <><img src={cnicBackPreview} alt="CNIC Back" className="w-full h-full object-cover absolute inset-0" /><div className="absolute inset-0 bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-sm font-semibold">Change Photo</span></div></>
                  ) : (
                    <><span className="text-2xl mb-1 text-[var(--muted)]">+</span><span className="text-xs text-[var(--muted)] font-medium">Click to upload back side</span><span className="text-[10px] text-[var(--muted)] mt-1">JPG/JPEG, max 10 MB</span></>
                  )}
                  <input type="file" accept=".jpg,.jpeg,image/jpeg" className="hidden" onChange={(e) => handleFileChange(setCnicBack, setCnicBackPreview, e)} />
                </label>
                {cnicBack && <span className="text-[11px] text-[var(--muted)] mt-1.5 truncate">{cnicBack.name} ({(cnicBack.size / 1024 / 1024).toFixed(2)} MB)</span>}
              </div>
              <h3 className="col-span-full text-lg font-bold mt-4 mb-0">Business Information</h3>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Business/Store Name *</label><input name="businessName" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="Enter your business name" /></div>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Business Type *</label><select name="businessType" required defaultValue="" className="px-3.5 py-3 pr-10 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)] appearance-none"><option value="" disabled>Select a category</option><option value="Fashion & Apparel">Fashion & Apparel</option><option value="Home & Household">Home & Household</option><option value="Kitchen & Cookware">Kitchen & Cookware</option><option value="Electronics">Electronics</option><option value="Other">Other</option></select></div>
              <div className="flex flex-col"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">City *</label><input name="city" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="Enter your city" /></div>
              <div className="flex flex-col"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Province/State *</label><input name="province" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="Enter your province" /></div>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Business Address *</label><textarea name="businessAddress" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)] resize-y min-h-[100px]" placeholder="Street address, area, and additional details" /></div>
              <h3 className="col-span-full text-lg font-bold mt-4 mb-0">Additional Information</h3>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Product Categories/Description *</label><textarea name="productDescription" required className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)] resize-y min-h-[100px]" placeholder="Describe the products you want to sell on our platform" /></div>
              <div className="flex flex-col col-span-full"><label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wide mb-2">Years of Business Experience</label><input name="experience" type="number" min="0" className="px-3.5 py-3 border-[1.5px] border-[var(--border)] rounded-[10px] text-sm bg-[var(--cream)] outline-none focus:border-[var(--accent)]" placeholder="e.g., 5" /></div>
              <div className="col-span-full mt-3">
                <div className="flex items-start gap-3 mb-3"><input type="checkbox" id="agreeTerms" name="agreeTerms" required className="mt-1 cursor-pointer w-[18px] h-[18px]" /><label htmlFor="agreeTerms" className="text-sm leading-relaxed cursor-pointer">I agree to the <Link to="/terms-vendors" target="_blank" className="text-[var(--accent)] font-semibold hover:underline">Vendor Terms & Conditions</Link> and understand the platform policies</label></div>
                <div className="flex items-start gap-3 mb-3"><input type="checkbox" id="agreeMarketing" name="agreeMarketing" className="mt-1 cursor-pointer w-[18px] h-[18px]" /><label htmlFor="agreeMarketing" className="text-sm leading-relaxed cursor-pointer">I consent to receiving communications about new features, updates, and opportunities</label></div>
              </div>
              {error && <div className="col-span-full bg-[#FEE2E2] border border-[#FECACA] text-[var(--red)] px-4 py-3 rounded-lg text-[13px] flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
              <button type="submit" disabled={submitting} className="col-span-full w-full bg-[var(--accent)] text-white border-none rounded-full py-4 text-[15px] font-bold cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(200,149,108,0.4)] hover:bg-[var(--accent-dark)] disabled:bg-[#ccc] disabled:cursor-not-allowed disabled:shadow-none mt-3">{submitting ? 'Submitting...' : 'Submit Application'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ─── Terms Vendors Page ─── */
function TermsVendorsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-5 pt-24 pb-16">
      <div className="text-center mb-12"><h1 className="font-['Playfair_Display'] text-[clamp(32px,5vw,48px)] font-bold mb-3">Vendor Terms & Conditions</h1><p className="text-base text-[var(--muted)]">Requirements and Policies for Selling on DUOBRO MART</p></div>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Welcome to DUOBRO MART Vendor Platform</h2><p className="leading-relaxed text-[15px]">These Vendor Terms & Conditions outline the requirements, responsibilities, and policies for sellers operating on the DUOBRO MART platform. By registering as a vendor and listing products, you agree to comply with these terms in their entirety.</p></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Vendor Eligibility & Registration</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Business Status:</strong> You must be a registered business, manufacturer, or authorized distributor with the legal right to sell products.</li><li><strong>Accurate Information:</strong> All information provided during registration must be accurate, complete, and verifiable.</li><li><strong>Legal Compliance:</strong> You must comply with all local, provincial, and national laws and regulations.</li><li><strong>Documentation:</strong> Upon request, you must provide proof of business registration, tax identification, or other required documentation.</li><li><strong>Approval Process:</strong> DUOBRO MART reserves the right to approve or reject vendor applications.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Product Listings & Quality Standards</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Product Accuracy:</strong> Product descriptions, specifications, prices, and images must be accurate and up-to-date.</li><li><strong>Quality Assurance:</strong> You are responsible for ensuring all products are in good condition and match the descriptions provided.</li><li><strong>Prohibited Items:</strong> You may not sell counterfeit, stolen, damaged, or prohibited items.</li><li><strong>Category Compliance:</strong> Products must be accurately categorized.</li><li><strong>Regular Updates:</strong> Keep product listings current, including pricing and availability.</li></ul></section>
      <div className="bg-[#FDF0E8] border-l-4 border-[var(--accent)] p-5 my-6 rounded-lg"><h4 className="font-bold mb-2">Quality Commitment</h4><p className="text-sm leading-relaxed">DUOBRO MART partners with vendors who prioritize customer satisfaction and product quality. Maintain high standards to build trust with customers.</p></div>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Pricing & Payment</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Price Transparency:</strong> All prices must be clearly displayed and include any applicable taxes or fees.</li><li><strong>Price Changes:</strong> Any changes to product pricing must be updated in the system immediately.</li><li><strong>Payment Terms:</strong> Vendors are responsible for specifying their preferred payment methods and terms.</li><li><strong>Commission Structure:</strong> DUOBRO MART may apply platform fees or commissions based on our agreed vendor arrangement.</li><li><strong>Settlement:</strong> Payments to vendors will be processed according to the terms established during onboarding.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Order Fulfillment & Delivery</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Order Acceptance:</strong> Once a customer places an order, you must confirm receipt via WhatsApp.</li><li><strong>Processing Timeline:</strong> Orders should be processed within the timeframe specified during your registration.</li><li><strong>Delivery Responsibility:</strong> You are responsible for timely delivery or arranging safe shipping.</li><li><strong>Tracking Communication:</strong> Keep customers informed about order status and any delays.</li><li><strong>Packaging:</strong> Products must be securely and professionally packaged to prevent damage during transit.</li><li><strong>Delivery Proof:</strong> Provide delivery confirmation to customers and maintain records for dispute resolution.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Customer Service & Communication</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Responsiveness:</strong> Respond to customer inquiries within 24 hours during business days.</li><li><strong>Professional Conduct:</strong> Maintain professional and courteous communication with all customers.</li><li><strong>Problem Resolution:</strong> Address customer complaints and issues fairly and promptly.</li><li><strong>Contact Information:</strong> Keep your WhatsApp number and email up-to-date so customers can reach you.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Returns & Refunds Policy</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Return Guidelines:</strong> Each vendor may establish their own return policy. Clearly communicate return conditions to customers.</li><li><strong>Return Processing:</strong> Process valid returns promptly and issue refunds within the timeframe specified in your policy.</li><li><strong>Damaged Products:</strong> For products damaged in transit, work with the customer to arrange replacement or refund.</li><li><strong>Documentation:</strong> Keep records of all returns and refunds for accounting and dispute resolution purposes.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Prohibited Activities</h2><p className="leading-relaxed text-[15px] mb-3">Vendors are strictly prohibited from:</p><ul className="ml-5 space-y-2 text-[15px]"><li>Selling counterfeit, stolen, or illegal items</li><li>Manipulating prices or engaging in fraudulent practices</li><li>Communicating with customers outside the platform to circumvent fees</li><li>Providing false product information or images</li><li>Engaging in abusive behavior toward customers or platform staff</li><li>Violating intellectual property rights or trademark laws</li><li>Using deceptive marketing or misleading promotional tactics</li></ul></section>
      <div className="bg-[#FDF0E8] border-l-4 border-[var(--accent)] p-5 my-6 rounded-lg"><h4 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-[var(--accent)]" /> Platform Violations</h4><p className="text-sm leading-relaxed">Violation of these terms may result in product removal, account suspension, or permanent termination from DUOBRO MART.</p></div>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Account Management & Suspension</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li><li><strong>Suspension Rights:</strong> DUOBRO MART reserves the right to suspend or terminate your account for violations of these terms.</li><li><strong>Appeal Process:</strong> If your account is suspended, you may request a review within 7 days with supporting documentation.</li><li><strong>Data Retention:</strong> Upon account termination, customer data and transaction records will be retained as required by law.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Intellectual Property & Liability</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Content Ownership:</strong> You retain ownership of product photos and descriptions you provide, but grant DUOBRO MART a license to display them on the platform.</li><li><strong>No Copyright Infringement:</strong> You warrant that all content you provide does not infringe on third-party intellectual property rights.</li><li><strong>Limited Liability:</strong> DUOBRO MART is not liable for product quality issues, delivery delays, or disputes between vendors and customers.</li><li><strong>Your Responsibility:</strong> You are solely responsible for any legal claims arising from your products or business practices.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Data & Privacy</h2><ul className="ml-5 space-y-2 text-[15px]"><li><strong>Customer Information:</strong> You may only use customer information for order fulfillment and related communication.</li><li><strong>Data Protection:</strong> Maintain customer data confidentiality and comply with local data protection regulations.</li><li><strong>No Sharing:</strong> Do not share or sell customer information to third parties without explicit consent.</li><li><strong>Privacy Compliance:</strong> Ensure your privacy practices comply with all applicable laws.</li></ul></section>
      <section className="mb-12"><h2 className="font-['Playfair_Display'] text-2xl font-bold mb-4">Changes & Amendments</h2><p className="leading-relaxed text-[15px]">DUOBRO MART reserves the right to modify these terms and conditions at any time. Changes will be communicated to vendors via email. Your continued operation on the platform following any changes constitutes acceptance of the updated terms.</p></section>
      <div className="bg-[var(--charcoal)] text-white p-8 rounded-2xl text-center mt-12"><h3 className="font-['Playfair_Display'] text-2xl mb-4">Need Assistance?</h3><p className="leading-relaxed mb-4">We're here to support your success on DUOBRO MART.</p><div className="flex gap-5 justify-center flex-wrap mt-5"><a href="https://wa.me/923313146400" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold transition-opacity hover:opacity-80"><Phone size={16} /> WhatsApp: +92 331 3146400</a><a href="mailto:duobroelite@gmail.com" className="inline-flex items-center gap-2 text-[var(--accent)] font-semibold transition-opacity hover:opacity-80"><Mail size={16} /> Email: duobroelite@gmail.com</a></div></div>
    </div>
  );
}

/* ─── App Shell ─── */
function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  return (
    <div className="min-h-screen bg-[var(--cream)] pt-24 pb-16 px-5">
      <section className="max-w-3xl mx-auto">
        <div className="mb-8"><p className="text-xs font-bold tracking-[2px] uppercase text-[var(--accent)]">My account</p><h1 className="font-['Playfair_Display'] text-4xl font-bold mt-2">Your Profile</h1><p className="text-[var(--muted)] mt-2">Manage your DUOBRO MART account details.</p></div>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="bg-[var(--charcoal)] px-6 py-7 sm:px-9 flex items-center gap-4"><div className="w-16 h-16 shrink-0 rounded-full bg-[var(--accent)] text-white text-xl font-bold flex items-center justify-center">{initials}</div><div><h2 className="font-['Playfair_Display'] text-2xl font-bold text-white">{user.name}</h2><p className="text-sm text-white/65 capitalize mt-1">{user.role} account</p></div></div>
          <div className="p-6 sm:p-9"><h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-5">Personal information</h3><dl className="divide-y divide-[var(--border)]"><div className="py-4 grid gap-1 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[var(--muted)]">Full name</dt><dd className="text-[var(--charcoal)]">{user.name}</dd></div><div className="py-4 grid gap-1 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[var(--muted)]">Email address</dt><dd className="text-[var(--charcoal)] break-all">{user.email}</dd></div><div className="py-4 grid gap-1 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-[var(--muted)]">Phone number</dt><dd className="text-[var(--charcoal)]">{user.phone}</dd></div></dl><div className="mt-8 pt-6 border-t border-[var(--border)]"><button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-[var(--charcoal)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--warm-brown)]"><LogOut size={17} /> Logout</button></div></div>
        </div>
      </section>
    </div>
  );
}

function AppContent() {
  useCart();
  const { user, signIn } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const startSession = (profile: UserProfile) => { signIn(profile); navigate('/home', { replace: true }); };
  const handleSignUp = (data: { firstName: string; lastName: string; email: string; phone: string }) => startSession({ name: `${data.firstName} ${data.lastName}`.trim(), email: data.email, phone: data.phone, role: 'customer' });
  const handleSignIn = (data: { email: string }) => {
    let stored: UserProfile | null = null;
    try { stored = JSON.parse(localStorage.getItem('duobro_user') || 'null'); } catch { /* use entered details */ }
    if (stored && stored.email.toLowerCase() === data.email.toLowerCase()) startSession(stored);
    else startSession({ name: data.email.split('@')[0] || 'Customer', email: data.email, phone: 'Not provided', role: 'customer' });
  };
  const handleAdminLogin = (data: { email: string }) => { signIn({ name: 'Administrator', email: data.email, phone: 'Not provided', role: 'admin' }); navigate('/admin', { replace: true }); };

  if (pathname === '/' || pathname === '/login') {
    if (user) return <Navigate to="/home" replace />;
    return <><ScrollToTop /><AuthPage onSignUp={handleSignUp} onSignIn={handleSignIn} /></>;
  }

  if (pathname === '/admin-login') {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <><ScrollToTop /><AdminLoginPage onAuthenticated={handleAdminLogin} /></>;
  }

  if (pathname === '/admin') {
    return user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/terms-buyers" element={<TermsBuyersPage />} />
          <Route path="/vendor-register" element={<VendorRegisterPage />} />
          <Route path="/terms-vendors" element={<TermsVendorsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
      <CartModal />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><CartProvider><AppContent /></CartProvider></AuthProvider></BrowserRouter>;
}

interface UserProfile { name: string; email: string; phone: string; role: 'customer' | 'admin' }
interface AuthCtx { user: UserProfile | null; signIn: (profile: UserProfile) => void; logout: () => void }
const AuthContext = createContext<AuthCtx | null>(null);
function useAuth() { const a = useContext(AuthContext); if (!a) throw new Error('no auth'); return a; }

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => { try { return JSON.parse(localStorage.getItem('duobro_user') || 'null'); } catch { return null; } });
  const signIn = (profile: UserProfile) => { setUser(profile); localStorage.setItem('duobro_user', JSON.stringify(profile)); };
  const logout = () => { setUser(null); localStorage.removeItem('duobro_user'); };
  return <AuthContext.Provider value={{ user, signIn, logout }}>{children}</AuthContext.Provider>;
}
