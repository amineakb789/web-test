import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Empty, Err, ROLE, useTitle } from "../components/ui.jsx";

export default function Admin() {
  useTitle("Administration");
  const [tab, setTab] = useState("shops"), [shops, setShops] = useState([]), [users, setUsers] = useState([]), [e, setE] = useState(""), [qs, setQs] = useState("");
  const load = () => Promise.all([api("/api/admin/shops").then(setShops), api("/api/admin/users").then(setUsers)]).catch(x => setE(x.message));
  useEffect(() => { load(); }, []);
  const act = async (fn) => { try { await fn(); load(); } catch (x) { setE(x.message); } };
  const toggleShop = s => act(() => api(`/api/admin/shops/${s.id}`, { method: "PATCH", body: { approved: !s.approved } }));
  const toggleUser = u => act(() => api(`/api/admin/users/${u.id}`, { method: "PATCH", body: { blocked: !u.blocked } }));
  const pending = shops.filter(s => !s.approved).length;
  const s = qs.trim().toLowerCase();
  const fs = shops.filter(x => !s || `${x.name} ${x.address}`.toLowerCase().includes(s)), fu = users.filter(x => !s || `${x.name} ${x.email}`.toLowerCase().includes(s));
  return <div className="page">
    <header className="page-head"><h1>Administration</h1><p>Valide les commerces et supervise les comptes.</p></header>
    <Err e={e} />
    <div className="toolbar"><div className="tabs"><button aria-pressed={tab === "shops"} onClick={() => setTab("shops")}>Commerces ({shops.length}){pending > 0 && <em className="dot">{pending} à valider</em>}</button>
      <button aria-pressed={tab === "users"} onClick={() => setTab("users")}>Utilisateurs ({users.length})</button></div>
      <label className="search"><input aria-label="Filtrer" placeholder="Filtrer par nom ou e-mail…" value={qs} onChange={e => setQs(e.target.value)} /></label></div>
    {tab === "shops" && (fs.length ? fs.map(s => <div className="panel row" key={s.id}>
      <span><b>{s.name}</b><br /><small className="muted">{s.address || "Adresse non renseignée"}{s.phone ? ` · ${s.phone}` : ""}</small></span>
      <span><span className={`badge ${s.approved ? "ok" : "wait"}`}>{s.approved ? "Validé" : "En attente"}</span>{" "}<button className={`btn small ${s.approved ? "ghost" : ""}`} onClick={() => toggleShop(s)}>{s.approved ? "Suspendre" : "Valider"}</button></span></div>)
      : <Empty title="Aucun commerce" text="Les commerçants apparaissent ici dès leur inscription." />)}
    {tab === "users" && <div className="panel table-wrap"><table><thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Statut</th><th></th></tr></thead>
      <tbody>{fu.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{ROLE[u.role]}</td>
        <td><span className={`badge ${u.blocked ? "blocked" : "ok"}`}>{u.blocked ? "Bloqué" : "Actif"}</span></td>
        <td>{u.role !== "admin" && <button className="btn small ghost" onClick={() => toggleUser(u)}>{u.blocked ? "Débloquer" : "Bloquer"}</button>}</td></tr>)}</tbody></table></div>}
  </div>;
}
