import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  User,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ShoppingBag,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/**
 * AuthPage — Sign In / Sign Up / Admin portal for DUOBRO MART
 *
 * Requires Tailwind CSS + lucide-react (`npm install lucide-react`).
 * Uses the Sora + Inter fonts — load them in your index.html <head>:
 *
  <link rel="preconnect" href="https://fonts.googleapis.com">
 <link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
 *
 * and add to your tailwind.config.js:
 *   theme.extend.fontFamily.display = ['Sora', 'sans-serif']
 *   theme.extend.colors = { ink:'#101A2E', ink2:'#1B2A47', marigold:'#F2A93B', marigold2:'#E0912A', cream:'#FBF7EF', slate:'#5B6B85' }
 *
 * Wire up onSignIn / onSignUp / onAdminLogin to your real auth logic.
 */

const BRAND = "DUOBRO MART";

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

interface StrengthMeta {
  label: string;
  color: string;
}

const strengthMeta: StrengthMeta[] = [
  { label: "", color: "bg-neutral-200" },
  { label: "Weak", color: "bg-red-400" },
  { label: "Fair", color: "bg-yellow-400" },
  { label: "Good", color: "bg-green-400" },
  { label: "Strong", color: "bg-green-600" },
];

interface SignInData {
  email: string;
  password: string;
  remember: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

interface AuthPageProps {
  onSignIn?: (data: SignInData) => void;
  onSignUp?: (data: SignUpData) => void;
}

export default function AuthPage({
  onSignIn = (data) => console.log("sign in", data),
  onSignUp = (data) => console.log("sign up", data),
}: AuthPageProps): JSX.Element {
  const [tab, setTab] = useState<"signin" | "signup">("signup");

  return (
    <div className="relative min-h-screen bg-[#FBF7EF] flex items-center justify-center p-4 sm:p-6">
      <Link
        to="/shop"
        className="absolute top-5 right-5 z-10 rounded-xl border border-[#101A2E]/15 bg-white px-4 py-2 text-sm font-semibold text-[#101A2E] shadow-sm transition-colors hover:bg-neutral-50 sm:top-6 sm:right-6"
      >
        Continue shopping
      </Link>
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(16,26,46,0.35)] overflow-hidden grid md:grid-cols-2">
        <BrandPanel />

        <div className="p-6 sm:p-10">
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#F2A93B] flex items-center justify-center">
              <ShoppingBag size={16} className="text-[#101A2E]" />
            </div>
            <span className="font-bold text-[#101A2E]">{BRAND}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 mb-8">
            <PillTab
              active={tab === "signup"}
              onClick={() => setTab("signup")}
              icon={<UserPlus size={14} />}
              label="Sign Up"
            />
            <PillTab
              active={tab === "signin"}
              onClick={() => setTab("signin")}
              icon={<User size={14} />}
              label="Sign In"
            />
          </div>

          {tab === "signin" && (
            <SignInForm onSubmit={onSignIn} onCreateAccount={() => setTab("signup")} />
          )}
          {tab === "signup" && (
            <SignUpForm onSubmit={onSignUp} onSignIn={() => setTab("signin")} />
          )}
          <div className="flex items-center justify-center gap-5 mt-8 text-xs text-[#5B6B85]/70">
            <span className="flex items-center gap-1">
              <Lock size={12} /> SSL Secured
            </span>
            <span className="flex items-center gap-1">
              <Shield size={12} /> Data Protected
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} /> Verified Platform
            </span>
          </div>
          <p className="mt-5 text-center text-xs text-[#5B6B85]">Are you a staff member? <Link to="/admin-login" className="font-bold text-[#E0912A] hover:text-[#F2A93B]">Admin login</Link></p>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Brand side panel -------------------------- */

function BrandPanel(): JSX.Element {
  const features: string[] = [
    "Fast local delivery across Karachi",
    "Order updates straight to WhatsApp",
    "Secure, encrypted checkout",
  ];

  return (
    <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-[#101A2E] to-[#1B2A47] text-white p-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-[#F2A93B]/70 flex items-center justify-center text-center -rotate-[8deg]">
        <span className="font-bold text-[10px] tracking-widest text-[#F2A93B] leading-tight">
          EST.
          <br />
          KARACHI
        </span>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-14">
          <div className="w-9 h-9 rounded-lg bg-[#F2A93B] flex items-center justify-center">
            <ShoppingBag size={18} className="text-[#101A2E]" />
          </div>
          <span className="font-bold text-lg tracking-tight">{BRAND}</span>
        </div>

        <h1 className="font-bold text-3xl leading-tight mb-4">
          Everything you
          <br />
          need, one cart
          <br />
          away.
        </h1>
        <p className="text-white/60 text-sm max-w-xs leading-relaxed">
          Sign in to track orders, save your favourites, and check out faster
          next time.
        </p>
      </div>

      <div className="relative z-10 space-y-4 mt-10">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-3 text-sm text-white/80">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ArrowRight size={14} className="text-[#F2A93B]" />
            </div>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Shared bits ----------------------------- */

interface PillTabProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function PillTab({ active, onClick, icon, label }: PillTabProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors",
        active ? "bg-white shadow-sm text-[#101A2E]" : "text-[#5B6B85]",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

interface FieldProps {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}

function Field({ label, action, children }: FieldProps): JSX.Element {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-[#101A2E]">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
}

function TextInput({ icon, right, className = "", ...props }: TextInputProps): JSX.Element {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6B85]/70">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={[
          "w-full py-2.5 rounded-xl border border-neutral-200 text-sm text-[#101A2E]",
          "placeholder:text-neutral-400",
          icon ? "pl-10" : "pl-3.5",
          right ? "pr-10" : "pr-4",
          "focus:outline-none focus:ring-2 focus:ring-[#F2A93B]/40 focus:border-[#F2A93B]",
          "transition-colors",
          className,
        ].join(" ")}
      />
      {right && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</span>
      )}
    </div>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  onClick: () => void;
}

function PasswordToggle({ visible, onClick }: PasswordToggleProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      className="text-[#5B6B85]/60 hover:text-[#101A2E]"
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

/* -------------------------------- Sign In -------------------------------- */

interface SignInFormProps {
  onSubmit: (data: SignInData) => void;
  onCreateAccount: () => void;
}

function SignInForm({ onSubmit, onCreateAccount }: SignInFormProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(true);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ email, password, remember });
      }}
      className="space-y-4"
    >
      <div className="mb-5">
        <h2 className="font-bold text-xl text-[#101A2E]">Welcome back</h2>
        <p className="text-sm text-[#5B6B85] mt-1">
          Sign in to your {BRAND} account
        </p>
      </div>

      <Field label="Email address">
        <TextInput
          icon={<Mail size={16} />}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>

      <Field
        label="Password"
        action={
          <a href="#forgot" className="text-xs font-semibold text-[#E0912A] hover:text-[#F2A93B]">
            Forgot password?
          </a>
        }
      >
        <TextInput
          icon={<Lock size={16} />}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          right={
            <PasswordToggle
              visible={showPassword}
              onClick={() => setShowPassword((s) => !s)}
            />
          }
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-[#5B6B85] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 rounded accent-[#F2A93B]"
        />
        Keep me logged in for 30 days
      </label>

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-[#101A2E] hover:bg-[#1B2A47] text-white text-sm font-semibold transition-colors"
      >
        Sign in to {BRAND}
      </button>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px bg-neutral-200 flex-1" />
        <span className="text-xs text-[#5B6B85]">or continue with</span>
        <div className="h-px bg-neutral-200 flex-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SocialButton label="Google" />
        <SocialButton label="Facebook" />
      </div>

      <p className="text-center text-sm text-[#5B6B85] pt-1">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-[#E0912A] font-semibold hover:text-[#F2A93B]"
        >
          Create one free
        </button>
      </p>
    </form>
  );
}

function SocialButton({ label }: { label: string }): JSX.Element {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-[#101A2E] hover:bg-neutral-50 transition-colors"
    >
      {label === "Google" ? (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.2 2.7-2.5 3.6v3h4C22.2 19 23.5 15.9 23.5 12.3Z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-4-3c-1.1.8-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4.1v3.1C3.4 21.3 7.4 24 12 24Z" />
          <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.4-.4-2.4s.1-1.7.4-2.4V6.5H1.3C.5 8.1 0 10 0 12s.5 3.9 1.3 5.5l4.1-3.1Z" />
          <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.1 0 12 0 7.4 0 3.4 2.7 1.3 6.5l4.1 3.1c.9-2.8 3.5-4.8 6.6-4.8Z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#1877F2" d="M24 12.07C24 5.4 18.6 0 12 0S0 5.4 0 12.07C0 18.1 4.4 23.1 10.1 24v-8.44H7.1v-3.5h3v-2.7c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.9v2.3h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.07Z" />
        </svg>
      )}
      {label}
    </button>
  );
}

/* -------------------------------- Sign Up -------------------------------- */

interface SignUpFormProps {
  onSubmit: (data: SignUpData) => void;
  onSignIn: () => void;
}

function SignUpForm({ onSubmit, onSignIn }: SignUpFormProps): JSX.Element {
  const [form, setForm] = useState<SignUpData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const update = (key: keyof SignUpData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const strength = getPasswordStrength(form.password);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.confirmPassword === form.password;

  const canSubmit =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    strength >= 2 &&
    passwordsMatch &&
    form.agree;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="mb-5">
        <h2 className="font-bold text-xl text-[#101A2E]">Join {BRAND}</h2>
        <p className="text-sm text-[#5B6B85] mt-1">
          Create your free shopping account
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <TextInput
            placeholder="Ahmed"
            value={form.firstName}
            onChange={update("firstName")}
            required
          />
        </Field>
        <Field label="Last name">
          <TextInput
            placeholder="Khan"
            value={form.lastName}
            onChange={update("lastName")}
            required
          />
        </Field>
      </div>

      <Field label="Email address">
        <TextInput
          icon={<Mail size={16} />}
          type="email"
          placeholder="ahmed@example.com"
          value={form.email}
          onChange={update("email")}
          required
        />
      </Field>

      <Field label="Phone number">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium text-[#101A2E] shrink-0">
            🇵🇰 +92
          </div>
          <TextInput
            icon={<Phone size={16} />}
            type="tel"
            placeholder="300 1234567"
            value={form.phone}
            onChange={update("phone")}
            required
          />
        </div>
      </Field>

      <Field label="Password">
        <TextInput
          icon={<Lock size={16} />}
          type={showPassword ? "text" : "password"}
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={update("password")}
          required
          right={
            <PasswordToggle
              visible={showPassword}
              onClick={() => setShowPassword((s) => !s)}
            />
          }
        />
        {form.password.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= strength ? strengthMeta[strength].color : "bg-neutral-200",
                  ].join(" ")}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#5B6B85] w-12 text-right">
              {strengthMeta[strength].label}
            </span>
          </div>
        )}
      </Field>

      <Field label="Confirm password">
        <TextInput
          icon={<Lock size={16} />}
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          required
          right={
            <PasswordToggle
              visible={showConfirm}
              onClick={() => setShowConfirm((s) => !s)}
            />
          }
        />
        {form.confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
        )}
      </Field>

      <label className="flex items-start gap-2 text-sm text-[#5B6B85] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.agree}
          onChange={update("agree")}
          className="w-4 h-4 mt-0.5 rounded accent-[#F2A93B]"
        />
        <span>
          I agree to {BRAND}'s{" "}
          <a href="#terms" className="text-[#E0912A] font-semibold">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#privacy" className="text-[#E0912A] font-semibold">
            Privacy Policy
          </a>
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          "w-full py-2.5 rounded-xl text-sm font-semibold transition-colors",
          canSubmit
            ? "bg-[#101A2E] hover:bg-[#1B2A47] text-white"
            : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
        ].join(" ")}
      >
        Create my account
      </button>

      <p className="text-center text-sm text-[#5B6B85]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="text-[#E0912A] font-semibold hover:text-[#F2A93B]"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

