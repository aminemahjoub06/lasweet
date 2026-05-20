import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CUSTOMER_TYPES,
  ORDER_STATUSES,
  STATUS_TONE,
  changePassword,
  login,
  logout,
  markAllMessagesRead,
  markAllNotificationsRead,
  clearNotifications,
  queueReorder,
  sendCustomerMessage,
  setOrderStatus,
  signup,
  updateDetails,
  useCurrentUser,
  useHydrated,
  useUnreadCounts,
  useUserNotifications,
  useUserOrders,
  type CustomerType,
  type NotificationType,
  type Order,
  type OrderStatus,
} from "@/lib/account";
import {
  LogOut,
  Package,
  Bell,
  MessageSquare,
  User as UserIcon,
  RotateCcw,
  Send,
  CheckCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  AlertCircle,
  PackageCheck,
  Mail,
  XCircle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — L&A Sweet" },
      {
        name: "description",
        content:
          "Sign in to track L&A Sweet orders, manage saved details, and reorder your signature trompe-l'œil desserts.",
      },
      { property: "og:title", content: "Your Account — L&A Sweet" },
      {
        property: "og:description",
        content: "Track orders, save details, and reorder L&A Sweet's signature trompe-l'œil desserts.",
      },
    ],
  }),
  component: AccountPage,
});

const inputCls =
  "w-full bg-ink-3/60 border border-line focus:border-gold/70 focus:outline-none px-4 py-3 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)]/35 transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.24em] uppercase text-[color:var(--foreground)]/65 mb-2">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-ink text-[color:var(--foreground)]">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
          <Link to="/" className="font-serif-display text-xl md:text-2xl leading-none">
            L<span className="text-gold">&</span>A <span className="italic">Sweet</span>
          </Link>
          <Link
            to="/"
            className="text-[10px] tracking-[0.24em] uppercase text-gold/80 hover:text-gold transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>
      {children}
    </main>
  );
}

function AccountPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();

  if (!hydrated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-24" />
      </PageShell>
    );
  }

  return <PageShell>{user ? <Dashboard /> : <AuthPanel />}</PageShell>;
}

/* ─────────────────────────── AUTH ─────────────────────────── */

function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  return (
    <section className="mx-auto max-w-5xl px-6 md:px-10 py-16 md:py-24">
      <div className="text-center mb-12">
        <div className="eyebrow mb-4">Customer Area</div>
        <h1 className="font-serif-display text-4xl md:text-5xl leading-tight">
          Your <span className="italic text-gold">Account</span>
        </h1>
        <p className="text-sm text-[color:var(--foreground)]/65 mt-4 max-w-xl mx-auto leading-relaxed">
          Sign in to track orders, save your details, and reorder in a click. Or continue browsing as a
          guest — quotes can still be placed without an account.
        </p>
      </div>

      <div
        className="mx-auto max-w-xl p-8 md:p-10 rounded-sm"
        style={{
          background: "rgba(8, 6, 3, 0.55)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(200, 155, 60, 0.35)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div className="grid grid-cols-2 mb-8 border border-line">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-[10px] tracking-[0.28em] uppercase py-3 transition-colors ${
                mode === m ? "bg-gold text-ink" : "text-gold/80 hover:bg-gold/10"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {mode === "login" ? <LoginForm /> : <SignupForm onDone={() => setMode("login")} />}

        <div className="border-t border-line mt-8 pt-6 text-center">
          <p className="text-[11px] italic text-[color:var(--foreground)]/55 mb-3">
            Prefer not to create an account?
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-[10px] tracking-[0.28em] uppercase text-gold border border-gold/40 px-6 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </section>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = login(email, password);
    if (!r.ok) setError(r.error);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Email" required>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Password" required>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
        />
      </Field>
      {error && (
        <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full bg-gold text-ink text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors"
      >
        Sign In
      </button>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [customerType, setCustomerType] = useState<CustomerType>("Restaurant");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
    if (!/^[+\d\s\-()]{6,20}$/.test(phone)) return setError("Please enter a valid phone number.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const r = signup({ fullName, email, phone, password, business, customerType });
    if (!r.ok) setError(r.error);
    else onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Full name" required>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} required maxLength={100} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Email" required>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
        </Field>
        <Field label="Phone" required>
          <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} required />
        </Field>
      </div>
      <Field label="Business (optional)">
        <input value={business} onChange={(e) => setBusiness(e.target.value)} className={inputCls} maxLength={120} />
      </Field>
      <Field label="Customer type" required>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CUSTOMER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCustomerType(t)}
              className={`text-[10px] tracking-[0.22em] uppercase py-3 border transition-colors ${
                customerType === t ? "bg-gold text-ink border-gold" : "text-gold border-gold/40 hover:border-gold"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Password" required>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} required minLength={8} />
        </Field>
        <Field label="Confirm password" required>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} required minLength={8} />
        </Field>
      </div>
      {error && (
        <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full bg-gold text-ink text-[11px] tracking-[0.28em] uppercase py-4 hover:bg-[color:var(--gold-soft)] transition-colors"
      >
        Create Account
      </button>
    </form>
  );
}

/* ─────────────────────────── DASHBOARD ─────────────────────────── */

type Tab = "orders" | "details" | "messages" | "notifications" | "reorder";

function Dashboard() {
  const user = useCurrentUser()!;
  const orders = useUserOrders();
  const [tab, setTab] = useState<Tab>("orders");
  const counts = useUnreadCounts();

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
  }[] = [
    { id: "orders", label: "My Orders", icon: Package, badge: orders.length || undefined },
    { id: "details", label: "Saved Details", icon: UserIcon },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: counts.messages || undefined },
    { id: "notifications", label: "Notifications", icon: Bell, badge: counts.notifications || undefined },
    { id: "reorder", label: "Reorder", icon: RotateCcw },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 md:px-10 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="eyebrow mb-3">Customer Area</div>
          <h1 className="font-serif-display text-3xl md:text-4xl leading-tight">
            Welcome, <span className="italic text-gold">{user.details.fullName.split(" ")[0] || "friend"}</span>
          </h1>
          <p className="text-sm text-[color:var(--foreground)]/60 mt-2">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.24em] uppercase text-gold border border-gold/40 px-5 py-3 hover:bg-gold hover:text-ink transition-colors self-start"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Sign out
        </button>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Side nav */}
        <nav className="md:border-r md:border-line md:pr-6">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab(t.id);
                      if (t.id === "messages") markAllMessagesRead(user.email);
                      if (t.id === "notifications") markAllNotificationsRead(user.email);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-[11px] tracking-[0.22em] uppercase border transition-colors whitespace-nowrap ${
                      active
                        ? "border-gold text-gold bg-gold/5"
                        : "border-transparent text-[color:var(--foreground)]/65 hover:text-gold hover:border-gold/30"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t.label}
                    </span>
                    {t.badge ? (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 bg-gold text-ink text-[10px] font-medium rounded-full">
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          {tab === "orders" && <OrdersTab />}
          {tab === "details" && <DetailsTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "reorder" && <ReorderTab />}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-line bg-ink-3/40 px-6 py-16 text-center">
      <p className="font-serif-display text-2xl text-gold/80">{title}</p>
      <p className="text-sm text-[color:var(--foreground)]/55 mt-3 max-w-md mx-auto">{body}</p>
      <Link
        to="/"
        className="inline-block mt-6 border border-gold/50 text-gold text-[10px] tracking-[0.28em] uppercase px-6 py-3 hover:bg-gold hover:text-ink transition-colors"
      >
        Browse the Collection →
      </Link>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span className={`inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {status}
    </span>
  );
}

function OrdersTab() {
  const user = useCurrentUser()!;
  const orders = useUserOrders();
  const [openRef, setOpenRef] = useState<string | null>(null);

  if (orders.length === 0)
    return <EmptyState title="No orders yet" body="Once you submit your first quote, it will appear here with live status updates." />;

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const open = openRef === o.ref;
        return (
          <article key={o.ref} className="border border-line bg-ink-3/40">
            <button
              type="button"
              onClick={() => setOpenRef(open ? null : o.ref)}
              className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ink-3/70 transition-colors"
            >
              <div>
                <div className="font-serif-display text-lg text-gold">{o.ref}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--foreground)]/55 mt-1">
                  {new Date(o.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  <span className="mx-2">·</span>
                  {o.items.reduce((s, i) => s + i.qty, 0)} pcs
                  <span className="mx-2">·</span>${o.estimate.min}–${o.estimate.max}
                </div>
              </div>
              <StatusBadge status={o.status} />
            </button>
            {open && (
              <div className="border-t border-line px-5 py-5 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-gold mb-3">Selection</div>
                    <ul className="space-y-2">
                      {o.items.map((i) => (
                        <li key={i.no} className="flex items-center gap-3 text-sm">
                          {i.image && (
                            <span className="h-10 w-10 border border-gold/40 bg-ink-3 p-1 flex items-center justify-center shrink-0">
                              <img src={i.image} alt={i.name} className="h-full w-full object-contain" loading="lazy" />
                            </span>
                          )}
                          <span className="flex-1">
                            {i.name}
                            <span className="text-[color:var(--foreground)]/50"> × {i.qty}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-gold mb-3">Timeline</div>
                    <ol className="space-y-2 text-xs">
                      {o.statusHistory.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-[color:var(--foreground)]/70">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_TONE[s.status].dot}`} />
                          <span className="flex-1">{s.status}</span>
                          <span className="text-[color:var(--foreground)]/40">
                            {new Date(s.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-line">
                  <Link
                    to="/"
                    onClick={() => queueReorder(o.items)}
                    className="border border-gold text-gold text-[10px] tracking-[0.24em] uppercase px-5 py-3 hover:bg-gold hover:text-ink transition-colors inline-flex items-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Reorder
                  </Link>
                  <details className="relative">
                    <summary className="list-none cursor-pointer border border-line text-[color:var(--foreground)]/70 text-[10px] tracking-[0.24em] uppercase px-5 py-3 hover:border-gold/60 transition-colors">
                      Simulate status
                    </summary>
                    <div className="absolute z-10 mt-2 right-0 min-w-[200px] bg-ink-3 border border-gold/40 p-2 shadow-lg">
                      {ORDER_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setOrderStatus(user.email, o.ref, s)}
                          className="w-full text-left text-[11px] tracking-[0.18em] uppercase px-3 py-2 text-[color:var(--foreground)]/70 hover:text-gold hover:bg-gold/5 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Inline order conversation */}
                <OrderConversation order={o} email={user.email} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function OrderConversation({ order, email }: { order: Order; email: string }) {
  const [text, setText] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendCustomerMessage(email, order.ref, text);
    setText("");
  };
  return (
    <div className="pt-5 border-t border-line">
      <div className="text-[10px] tracking-[0.24em] uppercase text-gold mb-3 inline-flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} /> Conversation
      </div>
      <ul className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
        {order.messages.map((m) => {
          const mine = m.from === "customer";
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed border ${
                  mine
                    ? "bg-gold/10 border-gold/40 text-[color:var(--foreground)]"
                    : m.from === "system"
                    ? "bg-ink-3/60 border-line text-[color:var(--foreground)]/70 italic"
                    : "bg-ink-3 border-gold/30 text-[color:var(--foreground)]/90"
                }`}
              >
                <p>{m.text}</p>
                <div
                  className={`text-[9px] tracking-[0.2em] uppercase mt-2 ${
                    mine ? "text-gold/70" : "text-[color:var(--foreground)]/40"
                  }`}
                >
                  {m.from === "studio" ? "L&A Sweet" : m.from === "system" ? "System" : "You"}
                  <span className="mx-2">·</span>
                  {new Date(m.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <form onSubmit={submit} className="flex items-end gap-2">
        <textarea
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message about this order…"
          className={`${inputCls} resize-none flex-1`}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="border border-gold text-gold text-[10px] tracking-[0.24em] uppercase px-4 py-3 hover:bg-gold hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.5} /> Send
        </button>
      </form>
    </div>
  );
}

function DetailsTab() {
  const user = useCurrentUser()!;
  const [fullName, setFullName] = useState(user.details.fullName);
  const [phone, setPhone] = useState(user.details.phone);
  const [business, setBusiness] = useState(user.details.business ?? "");
  const [customerType, setCustomerType] = useState<CustomerType>(user.details.customerType);
  const [saved, setSaved] = useState(false);

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails({ fullName: fullName.trim(), phone: phone.trim(), business: business.trim() || undefined, customerType });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePw = (e: React.FormEvent) => {
    e.preventDefault();
    const r = changePassword(curPw, newPw);
    if (r.ok) {
      setPwMsg("Password updated.");
      setCurPw("");
      setNewPw("");
    } else {
      setPwMsg(r.error);
    }
  };

  return (
    <div className="space-y-10">
      <form onSubmit={save} className="space-y-5 border border-line bg-ink-3/40 p-6 md:p-8">
        <div>
          <div className="text-[10px] tracking-[0.28em] uppercase text-gold mb-1">Saved details</div>
          <p className="text-xs text-[color:var(--foreground)]/55">Used to pre-fill your next order.</p>
        </div>
        <Field label="Full name" required>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} required />
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Email">
            <input value={user.email} disabled className={`${inputCls} opacity-60`} />
          </Field>
          <Field label="Phone" required>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} required />
          </Field>
        </div>
        <Field label="Business (optional)">
          <input value={business} onChange={(e) => setBusiness(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Customer type">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CUSTOMER_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCustomerType(t)}
                className={`text-[10px] tracking-[0.22em] uppercase py-3 border transition-colors ${
                  customerType === t ? "bg-gold text-ink border-gold" : "text-gold border-gold/40 hover:border-gold"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="bg-gold text-ink text-[10px] tracking-[0.28em] uppercase px-6 py-3 hover:bg-[color:var(--gold-soft)] transition-colors"
          >
            Save changes
          </button>
          {saved && <span className="text-[10px] tracking-[0.22em] uppercase text-gold">Saved ✓</span>}
        </div>
      </form>

      <form onSubmit={savePw} className="space-y-5 border border-line bg-ink-3/40 p-6 md:p-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-gold">Change password</div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Current password" required>
            <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="New password" required>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} required minLength={8} />
          </Field>
        </div>
        {pwMsg && (
          <p className="text-xs tracking-wide text-[color:var(--gold-soft)] border border-gold/30 bg-ink-3/60 px-4 py-3">
            {pwMsg}
          </p>
        )}
        <button
          type="submit"
          className="border border-gold text-gold text-[10px] tracking-[0.28em] uppercase px-6 py-3 hover:bg-gold hover:text-ink transition-colors"
        >
          Update password
        </button>
      </form>
    </div>
  );
}

function MessagesTab() {
  const user = useCurrentUser()!;
  const orders = useUserOrders();
  const threads = useMemo(
    () => orders.filter((o) => o.messages.length > 0).sort((a, b) => {
      const al = a.messages.at(-1)!.at;
      const bl = b.messages.at(-1)!.at;
      return +new Date(bl) - +new Date(al);
    }),
    [orders],
  );
  const [activeRef, setActiveRef] = useState<string | null>(threads[0]?.ref ?? null);
  const active = threads.find((t) => t.ref === activeRef) ?? threads[0];

  if (threads.length === 0)
    return (
      <EmptyState
        title="No conversations yet"
        body="When you reach out about an order — or we send you an update — the thread will appear here."
      />
    );

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-5 border border-line bg-ink-3/30 min-h-[500px]">
      <ul className="md:border-r border-line max-h-[600px] overflow-y-auto">
        {threads.map((t) => {
          const last = t.messages.at(-1)!;
          const unread = t.messages.filter((m) => m.from !== "customer" && !m.read).length;
          const selected = active?.ref === t.ref;
          return (
            <li key={t.ref}>
              <button
                type="button"
                onClick={() => setActiveRef(t.ref)}
                className={`w-full text-left px-4 py-4 border-b border-line/60 transition-colors ${
                  selected ? "bg-gold/10" : "hover:bg-ink-3/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-serif-display text-base text-gold">{t.ref}</span>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-gold text-ink text-[10px] font-medium rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[color:var(--foreground)]/65 mt-1 line-clamp-2">{last.text}</p>
                <div className="text-[9px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/40 mt-2">
                  {new Date(last.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="p-5 md:p-6 flex flex-col">
        {active && (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <div className="font-serif-display text-xl text-gold">{active.ref}</div>
                <div className="mt-1"><StatusBadge status={active.status} /></div>
              </div>
              <button
                type="button"
                onClick={() => markAllMessagesRead(user.email)}
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/60 hover:text-gold transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Mark read
              </button>
            </div>
            <OrderConversation order={active} email={user.email} />
          </>
        )}
      </div>
    </div>
  );
}

const NOTIFICATION_ICON: Record<NotificationType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  order_received: Sparkles,
  quote_sent: Mail,
  payment_required: AlertCircle,
  payment_confirmed: CreditCard,
  in_preparation: Package,
  ready_pickup: PackageCheck,
  out_for_delivery: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
  new_message: MessageSquare,
};

function NotificationsTab() {
  const user = useCurrentUser()!;
  const notifications = useUserNotifications();

  if (notifications.length === 0)
    return <EmptyState title="All quiet" body="You'll get a notification here whenever an order changes status or a new message arrives." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/60">
          {notifications.length} {notifications.length === 1 ? "notification" : "notifications"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => markAllNotificationsRead(user.email)}
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-gold border border-gold/40 px-4 py-2 hover:bg-gold hover:text-ink transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} /> Mark all read
          </button>
          <button
            type="button"
            onClick={() => clearNotifications(user.email)}
            className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--foreground)]/55 border border-line px-4 py-2 hover:border-gold/60 hover:text-gold transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <ul className="space-y-3">
        {notifications.map((n) => {
          const Icon = NOTIFICATION_ICON[n.type] ?? Bell;
          return (
            <li
              key={n.id}
              className={`relative border bg-ink-3/40 px-5 py-4 flex gap-4 transition-colors ${
                n.read ? "border-line" : "border-gold/60"
              }`}
            >
              <span
                className={`mt-0.5 h-9 w-9 inline-flex items-center justify-center border ${
                  n.read ? "border-line text-[color:var(--foreground)]/55" : "border-gold/60 text-gold"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${n.read ? "text-[color:var(--foreground)]/75" : "text-[color:var(--foreground)] font-medium"}`}>
                    {n.title}
                  </p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />}
                </div>
                <p className="text-xs text-[color:var(--foreground)]/65 mt-1 leading-relaxed">{n.body}</p>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--foreground)]/40 mt-2">
                  {n.ref && (
                    <>
                      Order {n.ref}
                      <span className="mx-2">·</span>
                    </>
                  )}
                  {new Date(n.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReorderTab() {
  const orders = useUserOrders();

  if (orders.length === 0)
    return <EmptyState title="Nothing to reorder" body="Past selections will show up here so you can repeat them in one click." />;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {orders.map((o) => (
        <article key={o.ref} className="border border-line bg-ink-3/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-serif-display text-lg text-gold">{o.ref}</div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--foreground)]/55">
              {new Date(o.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </span>
          </div>
          <ul className="space-y-2 mb-5">
            {o.items.map((i) => (
              <li key={i.no} className="flex items-center gap-3 text-sm">
                {i.image && (
                  <span className="h-9 w-9 border border-gold/40 bg-ink-3 p-1 flex items-center justify-center shrink-0">
                    <img src={i.image} alt={i.name} className="h-full w-full object-contain" loading="lazy" />
                  </span>
                )}
                <span className="flex-1">{i.name}</span>
                <span className="text-[color:var(--foreground)]/50">× {i.qty}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/"
            onClick={() => queueReorder(o.items)}
            className="w-full inline-flex items-center justify-center gap-2 border border-gold text-gold text-[10px] tracking-[0.28em] uppercase py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Reorder this selection
          </Link>
        </article>
      ))}
    </div>
  );
}
