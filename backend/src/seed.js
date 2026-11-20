// Données de démo, idempotentes (IDs fixes : relancer ne crée pas de doublons).
// Les coordonnées sont fictives, proches du centre de Tunis, pour tester le Campus Radar.
import { db } from "./firebase.js";
const shops = [
  { id: "demo-shop-1", name: "Café Médina", address: "Rue de l'ESSECT, Tunis", phone: "71 000 001", lat: 36.8068, lng: 10.1840, description: "Café de quartier : viennoiseries, sandwichs et boissons chaudes." },
  { id: "demo-shop-2", name: "Chez Samia", address: "Avenue Habib Bourguiba, Tunis", phone: "71 000 002", lat: 36.8001, lng: 10.1815, description: "Cuisine tunisienne maison, plats du jour et salades." },
  { id: "demo-shop-3", name: "Boulangerie El Baraka", address: "Rue de Marseille, Tunis", phone: "71 000 003", lat: 36.8032, lng: 10.1779, description: "Pain, pâtisseries et makroudh, fournée du matin et du soir." }];
// [id, commerce, titre, catégorie, prix initial, prix réduit, quantité, description, début, fin]
const offers = [
  ["demo-offer-1", "demo-shop-1", "Croissant au beurre", "Viennoiserie", 2.5, 1.2, 12, "Croissant pur beurre de la fournée du matin, encore croustillant.", "17:00", "19:00"],
  ["demo-offer-2", "demo-shop-1", "Sandwich thon-harissa", "Sandwich", 6, 3, 8, "Pain baguette, thon, harissa, olives, œuf et salade.", "17:00", "19:00"],
  ["demo-offer-3", "demo-shop-2", "Plat du jour : couscous", "Plat", 14, 7, 6, "Couscous à l'agneau et légumes, portion généreuse.", "18:00", "20:00"],
  ["demo-offer-4", "demo-shop-2", "Salade composée", "Salade", 9, 4.5, 5, "Salade fraîche : thon, maïs, tomates, poivrons grillés.", "18:00", "20:00"],
  ["demo-offer-5", "demo-shop-3", "Assortiment de pâtisseries", "Dessert", 12, 5, 7, "Six pâtisseries tunisiennes du jour : baklawa, makroudh, kaak warqa.", "18:30", "20:30"],
  ["demo-offer-6", "demo-shop-1", "Café + gâteau", "Boisson", 5, 2.5, 10, "Un café au choix et une part de gâteau maison.", "16:00", "18:00"],
  ["demo-offer-7", "demo-shop-3", "Panier surprise boulangerie", "Panier surprise", 15, 5, 6, "Contenu surprise : pains, viennoiseries et pâtisseries du jour, d'une valeur d'au moins 15 TND.", "19:00", "20:30"],
  ["demo-offer-8", "demo-shop-2", "Panier surprise repas", "Panier surprise", 20, 8, 4, "Contenu surprise : un plat, une salade et un dessert, d'une valeur d'au moins 20 TND.", "19:30", "21:00"]];
for (const s of shops) await db.collection("shops").doc(s.id).set({ ...s, ownerId: s.id, approved: true, createdAt: Date.now() }, { merge: true });
for (const [id, shopId, title, category, originalPrice, price, quantity, description, pickupFrom, pickupTo] of offers)
  await db.collection("offers").doc(id).set({ shopId, title, category, originalPrice, price, quantity, description, photo: "", pickupFrom, pickupTo, createdAt: Date.now() }, { merge: true });
console.log("Seed terminé.");
process.exit(0);
