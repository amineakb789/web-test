import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { QRCodeSVG } from "qrcode.react";
import { fb, api, enableNotifications, notificationsAvailable } from "./api.js";
import { Err, Badge, STATUS, useNow, Header, Footer } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import OfferDetail from "./pages/OfferDetail.jsx";
import Radar from "./pages/Radar.jsx";
import Impact from "./pages/Impact.jsx";
import Login from "./pages/Login.jsx";
import Merchant from "./pages/Merchant.jsx";
import Admin from "./pages/Admin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";

// ---------- Commandes ----------
function Orders({ me }) {
  const [list, setList] = useState([]), [e, setE] = useState(""), [filter, setFilter] = useState(""), now = useNow();
  const load = () => api("/api/my/orders").then(setList).catch(x => setE(x.message));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const pay = async o => { try { const { payUrl } = await api(`/api/orders/${o.id}/pay`, { method: "POST" }); window.location = payUrl; } catch (x) { setE(x.message); load(); } };
  const cancel = async o => { if (!window.confirm("Annuler cette réservation ?")) return; try { await api(`/api/orders/${o.id}/cancel`, { method: "POST" }); load(); } catch (x) { setE(x.message); } };
  const shown = list.filter(o => !filter || o.status === filter);
  const left = o => Math.max(0, (o.expiresAt || 0) - now);
  const mmss = ms => `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
  return <section><h1>Commandes</h1>
    <div className="filters"><select aria-label="Filtrer par statut" value={filter} onChange={e => setFilter(e.target.value)}><option value="">Tous les statuts</option>
      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
    <Err e={e} />
    {shown.map(o => <div className="panel row" key={o.id}>
      <div><h3>{o.title} × {o.quantity}</h3>
        <p className="muted">{o.total} TND · <Badge s={o.status === "pending_payment" && !left(o) ? "expired" : o.status} />{me.role === "merchant" && o.studentName ? ` · ${o.studentName}` : ""}</p>
        {me.role === "student" && o.status === "pending_payment" && left(o) > 0 && <>
          <p className="muted">Temps restant pour payer : <strong>{mmss(left(o))}</strong></p>
          <button className="btn small" onClick={() => pay(o)}>Payer avec Konnect</button>{" "}
          <button className="btn small ghost" onClick={() => cancel(o)}>Annuler</button></>}
      </div>
      {o.qrToken && o.status === "paid" && <div className="qr"><QRCodeSVG value={o.qrToken} size={120} /><small>{o.qrToken}</small></div>}
    </div>)}
    {!shown.length && <p className="muted">Aucune commande pour l'instant.</p>}</section>;
}

// ---------- Passerelle de paiement simulée (PAYMENT_PROVIDER=mock côté backend) ----------
function MockPay() {
  const { id } = useParams(), nav = useNavigate();
  const [o, setO] = useState(null), [e, setE] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { api("/api/my/orders").then(l => setO(l.find(x => x.id === id) || false)).catch(x => setE(x.message)); }, [id]);
  const pay = async () => { setBusy(true); try { await api(`/api/orders/${id}/mock-pay`, { method: "POST" }); nav("/orders"); } catch (x) { setE(x.message); setBusy(false); } };
  if (o === null && !e) return <p className="muted">Chargement…</p>;
  return <section className="panel narrow"><h1>Paiement (mode test)</h1>
    <p className="muted">Passerelle simulée : aucun argent n'est débité.</p>
    {o ? <><h3>{o.title} × {o.quantity}</h3><p><strong className="price">{o.total} TND</strong></p><Err e={e} />
      <button className="btn" onClick={pay} disabled={busy || o.status !== "pending_payment"}>Payer {o.total} TND (simulation)</button>{" "}
      <button className="btn ghost" onClick={() => nav("/orders")}>Retour</button></> : <Err e={e || "Commande introuvable."} />}</section>;
}

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

// ---------- Application ----------
export default function App() {
  const [me, setMe] = useState(null), [ready, setReady] = useState(false), [toast, setToast] = useState(null);
  const [perm, setPerm] = useState(() => notificationsAvailable() ? Notification.permission : "unavailable");
  const seq = useRef(0);
  const reload = async () => { // seq évite qu'une réponse ancienne écrase une plus récente
    const n = ++seq.current; let m = null;
    try { m = fb.currentUser ? await api("/api/me") : null; } catch { m = null; }
    if (n === seq.current) setMe(m);
    return m;
  };
  useEffect(() => onAuthStateChanged(fb, async () => { await reload(); setReady(true); }), []);
  useEffect(() => { if (me) enableNotifications({ onForeground: setToast }); }, [me?.uid]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t); }, [toast]);
  if (!ready) return <div className="boot" role="status" aria-label="Chargement"><span /></div>;
  const guard = (el, ...roles) => me && roles.includes(me.role) ? el : <Navigate to="/login" />;
  const all = ["student", "merchant", "admin"];
  const enableNotif = async () => { await enableNotifications({ ask: true, onForeground: setToast }); setPerm(Notification.permission); };
  return <>
    <a className="skip" href="#main">Aller au contenu</a>
    <ScrollTop />
    <Header me={me} perm={perm} onNotif={enableNotif} onLogout={() => signOut(fb)} />
    <main id="main"><Routes>
      <Route path="/" element={me?.role === "admin" ? <Navigate to="/admin" /> : <Home me={me} />} />
      <Route path="/catalog" element={<Catalog me={me} />} />
      <Route path="/offers" element={<Navigate to="/catalog" />} />
      <Route path="/offer/:id" element={<OfferDetail me={me} />} />
      <Route path="/radar" element={<Radar />} />
      <Route path="/impact" element={<Impact me={me} />} />
      <Route path="/login" element={<Login reload={reload} />} />
      <Route path="/orders" element={guard(<div className="page"><Orders me={me} /></div>, "student", "merchant")} />
      <Route path="/pay/:id" element={guard(<div className="page"><MockPay /></div>, "student")} />
      <Route path="/shop" element={guard(<Merchant me={me} />, "merchant")} />
      <Route path="/admin" element={guard(<Admin />, "admin")} />
      <Route path="/dashboard" element={guard(<Dashboard me={me} />, ...all)} />
      <Route path="/profile" element={guard(<Profile me={me} reload={reload} />, ...all)} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes></main>
    <Footer />
    {toast && <div className="toast" role="status"><strong>{toast.title}</strong>{toast.body}</div>}
  </>;
}
