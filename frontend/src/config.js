// Réglages du site (modifiables sans toucher aux composants).
// Point de départ de la carte Campus Radar. À REMPLACER par les coordonnées exactes de l'ESSECT.
export const CAMPUS = { name: "Campus", lat: 36.8065, lng: 10.1815 };

// Niveaux EcoPoints : points minimum pour atteindre chaque niveau.
export const ECO_LEVELS = [
  { name: "Graine", min: 0, color: "#8FD3A5" },
  { name: "Pousse", min: 50, color: "#4FB477" },
  { name: "Arbuste", min: 150, color: "#2E8B57" },
  { name: "Arbre", min: 400, color: "#1F6B45" },
  { name: "Forêt", min: 1000, color: "#0F4A2F" },
];
export const ecoLevel = (points = 0) => {
  const i = ECO_LEVELS.reduce((acc, l, idx) => (points >= l.min ? idx : acc), 0);
  const cur = ECO_LEVELS[i], next = ECO_LEVELS[i + 1] || null;
  return { ...cur, next, progress: next ? (points - cur.min) / (next.min - cur.min) : 1, toNext: next ? next.min - points : 0 };
};

// Estimations INDICATIVES de l'impact d'un repas sauvé (à adapter ou à sourcer dans le rapport).
export const IMPACT = { kgPerMeal: 0.4, co2PerKg: 2.5 };
