import { useState } from "react";
import { api } from "../api.js";
import { CAMPUS, ecoLevel } from "../config.js";
import RadarMap from "../components/RadarMap.jsx";
import { Err, Field, Icon, PHONE_RE, ROLE, useTitle } from "../components/ui.jsx";

export default function Profile({ me, reload }) {
  useTitle("Mon profil");
  const sh = me.shop || {};
  const [name, setName] = useState(me.name), [shop, setShop] = useState({ name: sh.name || "", address: sh.address || "", phone: sh.phone || "", description: sh.description || "" });
  const [pos, setPos] = useState(sh.lat != null && sh.lng != null ? { lat: sh.lat, lng: sh.lng } : null);
  const [msg, setMsg] = useState(""), [e, setE] = useState("");
  const run = async (fn, ok) => { setMsg(""); setE(""); try { await fn(); await reload(); setMsg(ok); } catch (x) { setE(x.message); } };
  const saveName = ev => { ev.preventDefault(); if (name.trim().length < 2) return setE("Nom trop court."); run(() => api("/api/me", { method: "PUT", body: { name } }), "Profil mis à jour."); };
  const saveShop = ev => {
    ev.preventDefault();
    if (shop.name.trim().length < 2) return setE("Le nom du commerce est obligatoire.");
    if (shop.phone && !PHONE_RE.test(shop.phone)) return setE("Téléphone invalide (8 à 15 chiffres).");
    run(() => api("/api/shop", { method: "PUT", body: { ...shop, lat: pos ? pos.lat : null, lng: pos ? pos.lng : null } }), "Informations du commerce mises à jour.");
  };
  const ss = k => ev => setShop({ ...shop, [k]: ev.target.value });
  const here = () => navigator.geolocation ? navigator.geolocation.getCurrentPosition(p => setPos({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }), () => setE("Position indisponible : clique sur la carte pour placer ton commerce."), { enableHighAccuracy: true, timeout: 10000 }) : setE("Géolocalisation indisponible.");
  const lvl = me.role === "student" ? ecoLevel(me.ecoPoints) : null;
  return <div className="page narrow-page">
    <header className="page-head"><h1>Mon profil</h1></header>
    <p className="ok" role="status">{msg}</p><Err e={e} />
    <form className="panel" onSubmit={saveName}><h3>Compte</h3>
      <p className="muted">{me.email} · {ROLE[me.role]}{lvl ? ` · ${me.ecoPoints || 0} EcoPoints (niveau ${lvl.name})` : ""}</p>
      <Field label="Nom complet"><input value={name} onChange={ev => setName(ev.target.value)} /></Field><div><button className="btn">Enregistrer</button></div></form>
    {me.role === "merchant" && <form className="panel" onSubmit={saveShop}><h3>Mon commerce</h3>
      <div className="form-grid">
        <Field label="Nom du commerce"><input value={shop.name} onChange={ss("name")} /></Field>
        <Field label="Adresse"><input value={shop.address} onChange={ss("address")} /></Field>
        <Field label="Téléphone"><input value={shop.phone} onChange={ss("phone")} inputMode="tel" /></Field></div>
      <Field label="Description"><input value={shop.description} onChange={ss("description")} maxLength={300} /></Field>
      <div className="locate"><h4><Icon name="pin" size={18} />Position sur le Campus Radar</h4>
        <p className="muted">{pos ? `Position enregistrée : ${pos.lat}, ${pos.lng}` : "Position non renseignée : ton commerce n'apparaît pas sur la carte."}</p>
        <div className="locate-actions"><button type="button" className="btn small" onClick={here}><Icon name="nav" size={16} />Utiliser ma position</button>{pos && <button type="button" className="btn small ghost" onClick={() => setPos(null)}>Retirer</button>}</div>
        <RadarMap center={pos || CAMPUS} picked={pos} onPick={(lat, lng) => setPos({ lat, lng })} zoom={15} /><small className="muted">Clique sur la carte pour placer ton commerce, puis enregistre.</small></div>
      <div><button className="btn">Enregistrer</button></div></form>}
  </div>;
}
