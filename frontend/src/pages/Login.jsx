import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { fb, api } from "../api.js";
import { EMAIL_RE, PHONE_RE, FB_ERR, Err, Field, FoodArt, Icon, Logo, useTitle } from "../components/ui.jsx";

export default function Login({ reload }) {
  const nav = useNavigate(), [params] = useSearchParams();
  const [signup, setSignup] = useState(params.get("signup") === "1");
  useTitle(signup ? "Créer un compte" : "Connexion");
  const [f, setF] = useState({ email: "", password: "", name: "", role: "student", shopName: "", address: "", phone: "" });
  const [errs, setErrs] = useState({}), [e, setE] = useState(""), [busy, setBusy] = useState(false);
  const set = k => ev => setF({ ...f, [k]: ev.target.value });
  const cls = k => errs[k] ? "invalid" : "";
  const check = () => {
    const x = {};
    if (!EMAIL_RE.test(f.email)) x.email = "Adresse e-mail invalide.";
    if (f.password.length < 6) x.password = "6 caractères minimum.";
    if (signup) {
      if (f.name.trim().length < 2) x.name = "Le nom est obligatoire (2 caractères minimum).";
      if (f.role === "merchant") {
        if (f.shopName.trim().length < 2) x.shopName = "Le nom du commerce est obligatoire.";
        if (f.phone && !PHONE_RE.test(f.phone)) x.phone = "Numéro invalide (8 à 15 chiffres).";
      }
    }
    return x;
  };
  const submit = async ev => {
    ev.preventDefault(); setE("");
    const x = check(); setErrs(x); if (Object.keys(x).length) return;
    setBusy(true);
    try {
      if (signup) {
        const cred = await createUserWithEmailAndPassword(fb, f.email, f.password);
        const body = { name: f.name, role: f.role, ...(f.role === "merchant" && { shopName: f.shopName, address: f.address, phone: f.phone }) };
        try { await api("/api/users", { method: "POST", body }); }
        catch (err) { await cred.user.delete().catch(() => {}); throw err; } // évite un compte Firebase sans profil
      } else await signInWithEmailAndPassword(fb, f.email, f.password);
      const me = await reload();
      if (!me) { await signOut(fb); return setE("Profil introuvable ou compte bloqué."); }
      nav(me.role === "admin" ? "/admin" : me.role === "merchant" ? "/shop" : "/");
    } catch (err) { setE(FB_ERR[err.code] || err.message); } finally { setBusy(false); }
  };
  return <div className="auth">
    <aside className="auth-side"><Logo light /><div><h2>{signup ? "Rejoins ceux qui sauvent des repas." : "Content de te revoir."}</h2>
      <ul><li><Icon name="bolt" size={18} />Réserve en deux clics</li><li><Icon name="qr" size={18} />Récupère avec un QR code</li><li><Icon name="leaf" size={18} />Gagne des EcoPoints</li></ul></div>
      <FoodArt category="Panier surprise" className="auth-art" /></aside>
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1>{signup ? "Créer un compte" : "Se connecter"}</h1>
      {signup && <>
        <Field label="Nom complet" error={errs.name}><input className={cls("name")} value={f.name} onChange={set("name")} autoComplete="name" /></Field>
        <fieldset className="roles"><legend>Je suis</legend>
          {[["student", "Étudiant", "Je réserve des repas"], ["merchant", "Commerçant", "Je vends mes invendus"]].map(([v, t, d]) => <label key={v} className={f.role === v ? "on" : ""}><input type="radio" name="role" checked={f.role === v} onChange={() => setF({ ...f, role: v })} /><b>{t}</b><small>{d}</small></label>)}</fieldset>
        {f.role === "merchant" && <>
          <Field label="Nom du commerce" error={errs.shopName}><input className={cls("shopName")} value={f.shopName} onChange={set("shopName")} /></Field>
          <Field label="Adresse"><input value={f.address} onChange={set("address")} /></Field>
          <Field label="Téléphone (facultatif)" error={errs.phone}><input className={cls("phone")} value={f.phone} onChange={set("phone")} inputMode="tel" /></Field>
          <p className="note">Ton commerce sera visible après validation par l'administrateur.</p></>}</>}
      <Field label="E-mail" error={errs.email}><input type="email" className={cls("email")} value={f.email} onChange={set("email")} autoComplete="email" /></Field>
      <Field label="Mot de passe" error={errs.password}><input type="password" className={cls("password")} value={f.password} onChange={set("password")} autoComplete={signup ? "new-password" : "current-password"} /></Field>
      <Err e={e} /><button className="btn lg" disabled={busy}>{busy ? "Patiente…" : signup ? "Créer mon compte" : "Se connecter"}</button>
      <button type="button" className="link" onClick={() => { setSignup(!signup); setErrs({}); setE(""); }}>{signup ? "J'ai déjà un compte" : "Pas encore de compte ? Inscris-toi"}</button>
    </form></div>;
}
