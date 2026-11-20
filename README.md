# CampusSave — Intégration Web (React + Node/Express + Firebase)

## Prérequis
Node 18+, un projet Firebase (Authentication e-mail/mot de passe + Firestore), un compte Konnect sandbox.

## Installation
1. Firebase Console : activer **Authentication > E-mail/mot de passe** et **Firestore**.
2. Paramètres du projet > Comptes de service > générer une clé → `backend/serviceAccountKey.json` (ignoré par Git).
3. Backend : `cd backend && cp .env.example .env` (renseigner Konnect), puis `npm install && npm run seed && npm run dev`.
4. Frontend : `cd frontend && cp .env.example .env` (config web Firebase), puis `npm install && npm run dev` → http://localhost:5173.
5. Règles Firestore : `firebase deploy --only firestore:rules` (fichier `firestore.rules`, tout passe par le backend).
6. Compte administrateur : créer un compte normal, puis dans Firestore, collection `users`, passer son champ `role` à `admin`.
7. Paiement : Konnect doit joindre `PUBLIC_API_URL` (en local, utiliser un tunnel type ngrok).

## Flux
Commerçant s'inscrit → admin valide → offres publiées → étudiant réserve (stock décrémenté en transaction) → paie via Konnect → webhook vérifié → QR généré → le commerçant saisit le code du QR pour valider le retrait.
